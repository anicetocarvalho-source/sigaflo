
-- Enum estados do cartão
DO $$ BEGIN
  CREATE TYPE public.card_status AS ENUM ('rascunho','gerado','impresso','entregue','revogado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.card_event_type AS ENUM ('generated','printed','delivered','revoked','reissued','qr_regenerated','scanned');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.export_job_status AS ENUM ('pending','processing','done','error');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tabela principal
CREATE TABLE IF NOT EXISTS public.farmer_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  serial TEXT UNIQUE,
  qr_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16),'hex'),
  card_status public.card_status NOT NULL DEFAULT 'gerado',
  version INTEGER NOT NULL DEFAULT 1,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  printed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  issued_by UUID REFERENCES public.profiles(id),
  printed_by UUID REFERENCES public.profiles(id),
  delivered_by UUID REFERENCES public.profiles(id),
  revoked_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_farmer_cards_farmer ON public.farmer_cards(farmer_id, card_status);
CREATE INDEX IF NOT EXISTS idx_farmer_cards_status ON public.farmer_cards(card_status);
CREATE INDEX IF NOT EXISTS idx_farmer_cards_qr_token ON public.farmer_cards(qr_token);

-- Eventos
CREATE TABLE IF NOT EXISTS public.farmer_card_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.farmer_cards(id) ON DELETE CASCADE,
  event_type public.card_event_type NOT NULL,
  actor_id UUID REFERENCES public.profiles(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_card_events_card ON public.farmer_card_events(card_id, created_at DESC);

-- Jobs de exportação em lote
CREATE TABLE IF NOT EXISTS public.card_export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  status public.export_job_status NOT NULL DEFAULT 'pending',
  total INTEGER NOT NULL DEFAULT 0,
  processed INTEGER NOT NULL DEFAULT 0,
  file_path TEXT,
  error_message TEXT,
  options JSONB DEFAULT '{}'::jsonb,
  farmer_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_export_jobs_user ON public.card_export_jobs(requested_by, created_at DESC);

-- Função: gerar serial CART-AAAA-NNNNNN
CREATE OR REPLACE FUNCTION public.generate_card_serial()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE v_year TEXT; v_seq INTEGER; v_prefix TEXT;
BEGIN
  IF NEW.serial IS NULL THEN
    v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    v_prefix := 'CART-' || v_year || '-';
    SELECT COALESCE(MAX(CAST(SUBSTRING(serial FROM LENGTH(v_prefix)+1) AS INTEGER)),0)+1
      INTO v_seq FROM public.farmer_cards WHERE serial LIKE v_prefix || '%';
    NEW.serial := v_prefix || LPAD(v_seq::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_farmer_cards_serial ON public.farmer_cards;
CREATE TRIGGER trg_farmer_cards_serial
  BEFORE INSERT ON public.farmer_cards
  FOR EACH ROW EXECUTE FUNCTION public.generate_card_serial();

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_farmer_cards_updated ON public.farmer_cards;
CREATE TRIGGER trg_farmer_cards_updated
  BEFORE UPDATE ON public.farmer_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_export_jobs_updated ON public.card_export_jobs;
CREATE TRIGGER trg_export_jobs_updated
  BEFORE UPDATE ON public.card_export_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auditoria + log de evento ao criar cartão
CREATE OR REPLACE FUNCTION public.audit_farmer_card_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_action TEXT; v_old JSONB; v_new JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'create'; v_old := NULL; v_new := to_jsonb(NEW);
    INSERT INTO public.farmer_card_events(card_id, event_type, actor_id, metadata)
      VALUES (NEW.id, 'generated', auth.uid(), jsonb_build_object('serial', NEW.serial));
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update'; v_old := to_jsonb(OLD); v_new := to_jsonb(NEW);
    IF NEW.card_status <> OLD.card_status THEN
      INSERT INTO public.farmer_card_events(card_id, event_type, actor_id, metadata)
        VALUES (NEW.id,
          CASE NEW.card_status
            WHEN 'impresso' THEN 'printed'::public.card_event_type
            WHEN 'entregue' THEN 'delivered'::public.card_event_type
            WHEN 'revogado' THEN 'revoked'::public.card_event_type
            ELSE 'generated'::public.card_event_type
          END,
          auth.uid(),
          jsonb_build_object('from', OLD.card_status, 'to', NEW.card_status, 'reason', NEW.revoked_reason));
    END IF;
  END IF;
  INSERT INTO public.audit_log(entity_type, entity_id, action, old_values, new_values, user_id)
    VALUES ('farmer_cards', COALESCE(NEW.id, OLD.id), v_action, v_old, v_new, auth.uid());
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_farmer_cards_audit ON public.farmer_cards;
CREATE TRIGGER trg_farmer_cards_audit
  AFTER INSERT OR UPDATE ON public.farmer_cards
  FOR EACH ROW EXECUTE FUNCTION public.audit_farmer_card_change();

-- Regenerar QR
CREATE OR REPLACE FUNCTION public.regenerate_card_qr(_card_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_token TEXT;
BEGIN
  IF NOT public.is_technician_or_admin(auth.uid()) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  v_token := encode(gen_random_bytes(16),'hex');
  UPDATE public.farmer_cards
    SET qr_token = v_token, version = version + 1, updated_at = now()
    WHERE id = _card_id;
  INSERT INTO public.farmer_card_events(card_id, event_type, actor_id, metadata)
    VALUES (_card_id, 'qr_regenerated', auth.uid(), jsonb_build_object('new_version', (SELECT version FROM public.farmer_cards WHERE id=_card_id)));
  RETURN v_token;
END;
$$;

-- Revogar
CREATE OR REPLACE FUNCTION public.revoke_farmer_card(_card_id UUID, _reason TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_technician_or_admin(auth.uid()) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  UPDATE public.farmer_cards
    SET card_status = 'revogado',
        revoked_at = now(),
        revoked_reason = _reason,
        revoked_by = auth.uid()
    WHERE id = _card_id;
END;
$$;

-- Registar leitura do QR (sem auth requerida)
CREATE OR REPLACE FUNCTION public.log_card_scan(_qr_token TEXT, _meta JSONB DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_card UUID;
BEGIN
  SELECT id INTO v_card FROM public.farmer_cards WHERE qr_token = _qr_token;
  IF v_card IS NOT NULL THEN
    INSERT INTO public.farmer_card_events(card_id, event_type, actor_id, metadata)
      VALUES (v_card, 'scanned', auth.uid(), _meta);
  END IF;
END;
$$;

-- Vista pública sanitizada
CREATE OR REPLACE VIEW public.card_verification_view
WITH (security_invoker = on) AS
SELECT
  c.qr_token,
  c.serial,
  c.card_status,
  c.version,
  c.issued_at,
  c.updated_at,
  f.name AS farmer_name,
  f.farmer_type,
  f.photo_url,
  f.main_crops,
  f.cultivated_area_ha,
  p.name AS province_name,
  m.name AS municipality_name,
  CASE WHEN c.card_status = 'revogado' THEN false ELSE f.is_active END AS is_active
FROM public.farmer_cards c
JOIN public.farmers f ON f.id = c.farmer_id
LEFT JOIN public.provinces p ON p.id = f.province_id
LEFT JOIN public.municipalities m ON m.id = f.municipality_id;

GRANT SELECT ON public.card_verification_view TO anon, authenticated;

-- RLS
ALTER TABLE public.farmer_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_card_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_export_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Técnicos leem cartões da sua jurisdição" ON public.farmer_cards;
CREATE POLICY "Técnicos leem cartões da sua jurisdição"
ON public.farmer_cards FOR SELECT
USING (
  public.is_technician_or_admin(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.farmers f
    WHERE f.id = farmer_id
    AND public.can_access_province(auth.uid(), f.province_id)
  )
);

DROP POLICY IF EXISTS "Técnicos criam cartões" ON public.farmer_cards;
CREATE POLICY "Técnicos criam cartões"
ON public.farmer_cards FOR INSERT
WITH CHECK (
  public.is_technician_or_admin(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.farmers f
    WHERE f.id = farmer_id
    AND public.can_access_province(auth.uid(), f.province_id)
  )
);

DROP POLICY IF EXISTS "Técnicos atualizam cartões" ON public.farmer_cards;
CREATE POLICY "Técnicos atualizam cartões"
ON public.farmer_cards FOR UPDATE
USING (public.is_technician_or_admin(auth.uid()))
WITH CHECK (public.is_technician_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Técnicos leem eventos cartão" ON public.farmer_card_events;
CREATE POLICY "Técnicos leem eventos cartão"
ON public.farmer_card_events FOR SELECT
USING (public.is_technician_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Sistema insere eventos cartão" ON public.farmer_card_events;
CREATE POLICY "Sistema insere eventos cartão"
ON public.farmer_card_events FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Utilizador vê os seus jobs" ON public.card_export_jobs;
CREATE POLICY "Utilizador vê os seus jobs"
ON public.card_export_jobs FOR SELECT
USING (requested_by = auth.uid() OR public.has_role(auth.uid(), 'admin_national'));

DROP POLICY IF EXISTS "Utilizador cria jobs" ON public.card_export_jobs;
CREATE POLICY "Utilizador cria jobs"
ON public.card_export_jobs FOR INSERT
WITH CHECK (requested_by = auth.uid() AND public.is_technician_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Utilizador atualiza os seus jobs" ON public.card_export_jobs;
CREATE POLICY "Utilizador atualiza os seus jobs"
ON public.card_export_jobs FOR UPDATE
USING (requested_by = auth.uid() OR public.has_role(auth.uid(), 'admin_national'));

-- Bucket privado para exports
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-exports', 'card-exports', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Utilizador lê os seus exports" ON storage.objects;
CREATE POLICY "Utilizador lê os seus exports"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-exports' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Sistema escreve exports" ON storage.objects;
CREATE POLICY "Sistema escreve exports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'card-exports' AND (storage.foldername(name))[1] = auth.uid()::text);
