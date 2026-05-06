
-- ============ Plano de Maneio Florestal (EUDR) ============
CREATE TABLE IF NOT EXISTS public.forest_management_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_number TEXT UNIQUE,
  operator_id UUID REFERENCES public.forest_operators(id) ON DELETE SET NULL,
  license_id UUID REFERENCES public.forest_licenses(id) ON DELETE SET NULL,
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  title TEXT NOT NULL,
  total_area_ha NUMERIC(12,2) NOT NULL DEFAULT 0,
  productive_area_ha NUMERIC(12,2),
  cutting_cycle_years INTEGER,
  annual_allowable_cut_m3 NUMERIC(12,2),
  species JSONB DEFAULT '[]'::jsonb,
  geometry JSONB,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'rascunho',
  eudr_compliant BOOLEAN DEFAULT FALSE,
  eudr_evidence JSONB DEFAULT '{}'::jsonb,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

CREATE OR REPLACE FUNCTION public.generate_management_plan_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_year TEXT; v_seq INTEGER;
BEGIN
  IF NEW.plan_number IS NOT NULL THEN RETURN NEW; END IF;
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  SELECT COALESCE(MAX(CAST(SUBSTRING(plan_number FROM 9) AS INTEGER)),0)+1
    INTO v_seq FROM public.forest_management_plans
    WHERE plan_number LIKE 'PMF-' || v_year || '-%';
  NEW.plan_number := 'PMF-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_gen_pmf_number BEFORE INSERT ON public.forest_management_plans
  FOR EACH ROW EXECUTE FUNCTION public.generate_management_plan_number();
CREATE TRIGGER trg_pmf_updated_at BEFORE UPDATE ON public.forest_management_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.forest_management_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY pmf_select ON public.forest_management_plans FOR SELECT
  USING (public.is_national_level(auth.uid()) OR public.can_access_province(province_id));
CREATE POLICY pmf_write ON public.forest_management_plans FOR INSERT
  WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY pmf_update ON public.forest_management_plans FOR UPDATE
  USING (public.is_technician_or_admin(auth.uid()));
CREATE POLICY pmf_delete ON public.forest_management_plans FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ============ Pagamentos AGT (TRX + 10% RL) ============
CREATE TABLE IF NOT EXISTS public.forest_payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT UNIQUE,
  operator_id UUID REFERENCES public.forest_operators(id) ON DELETE SET NULL,
  license_id UUID REFERENCES public.forest_licenses(id) ON DELETE SET NULL,
  permit_id UUID REFERENCES public.forest_transport_permits(id) ON DELETE SET NULL,
  reference_type TEXT NOT NULL,
  base_amount_aoa NUMERIC(14,2) NOT NULL DEFAULT 0,
  surcharge_rl_aoa NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_amount_aoa NUMERIC(14,2) GENERATED ALWAYS AS (base_amount_aoa + surcharge_rl_aoa) STORED,
  status TEXT NOT NULL DEFAULT 'pendente',
  agt_reference TEXT,
  agt_response JSONB,
  paid_at TIMESTAMPTZ,
  province_id UUID REFERENCES public.provinces(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

CREATE OR REPLACE FUNCTION public.generate_trx_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_year TEXT; v_seq INTEGER;
BEGIN
  IF NEW.transaction_number IS NOT NULL THEN RETURN NEW; END IF;
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 9) AS INTEGER)),0)+1
    INTO v_seq FROM public.forest_payment_transactions
    WHERE transaction_number LIKE 'TRX-' || v_year || '-%';
  NEW.transaction_number := 'TRX-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  RETURN NEW;
END; $$;

-- Calcula automaticamente surcharge 10% RL se não for fornecida
CREATE OR REPLACE FUNCTION public.compute_surcharge_rl()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.surcharge_rl_aoa IS NULL OR NEW.surcharge_rl_aoa = 0 THEN
    NEW.surcharge_rl_aoa := ROUND(NEW.base_amount_aoa * 0.10, 2);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_gen_trx_number BEFORE INSERT ON public.forest_payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.generate_trx_number();
CREATE TRIGGER trg_trx_surcharge BEFORE INSERT OR UPDATE ON public.forest_payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.compute_surcharge_rl();
CREATE TRIGGER trg_trx_updated_at BEFORE UPDATE ON public.forest_payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.forest_payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY trx_select ON public.forest_payment_transactions FOR SELECT
  USING (public.is_national_level(auth.uid()) OR public.can_access_province(province_id));
CREATE POLICY trx_insert ON public.forest_payment_transactions FOR INSERT
  WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY trx_update ON public.forest_payment_transactions FOR UPDATE
  USING (public.is_technician_or_admin(auth.uid()));

-- ============ Certificados Verdes ============
CREATE TABLE IF NOT EXISTS public.forest_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT UNIQUE,
  operator_id UUID REFERENCES public.forest_operators(id) ON DELETE SET NULL,
  license_id UUID REFERENCES public.forest_licenses(id) ON DELETE SET NULL,
  classification TEXT NOT NULL DEFAULT 'B',
  score NUMERIC(5,2),
  criteria JSONB DEFAULT '{}'::jsonb,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  status TEXT NOT NULL DEFAULT 'ativo',
  province_id UUID REFERENCES public.provinces(id),
  qr_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16),'hex'),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

CREATE OR REPLACE FUNCTION public.generate_forest_certificate_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_year TEXT; v_seq INTEGER;
BEGIN
  IF NEW.certificate_number IS NOT NULL THEN RETURN NEW; END IF;
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_number FROM 10) AS INTEGER)),0)+1
    INTO v_seq FROM public.forest_certificates
    WHERE certificate_number LIKE 'FCERT-' || v_year || '-%';
  NEW.certificate_number := 'FCERT-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_gen_fcert_number BEFORE INSERT ON public.forest_certificates
  FOR EACH ROW EXECUTE FUNCTION public.generate_forest_certificate_number();
CREATE TRIGGER trg_fcert_updated_at BEFORE UPDATE ON public.forest_certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.forest_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY fcert_select ON public.forest_certificates FOR SELECT
  USING (public.is_national_level(auth.uid()) OR public.can_access_province(province_id));
CREATE POLICY fcert_write ON public.forest_certificates FOR INSERT
  WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY fcert_update ON public.forest_certificates FOR UPDATE
  USING (public.is_technician_or_admin(auth.uid()));

-- ============ Ocorrências Florestais (incêndios, pragas) ============
CREATE TABLE IF NOT EXISTS public.forest_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_number TEXT UNIQUE,
  occurrence_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'aberta',
  description TEXT,
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  affected_area_ha NUMERIC(12,2),
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reported_by UUID,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.generate_forest_occurrence_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_year TEXT; v_seq INTEGER;
BEGIN
  IF NEW.occurrence_number IS NOT NULL THEN RETURN NEW; END IF;
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  SELECT COALESCE(MAX(CAST(SUBSTRING(occurrence_number FROM 9) AS INTEGER)),0)+1
    INTO v_seq FROM public.forest_occurrences
    WHERE occurrence_number LIKE 'OCC-' || v_year || '-%';
  NEW.occurrence_number := 'OCC-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_gen_occ_number BEFORE INSERT ON public.forest_occurrences
  FOR EACH ROW EXECUTE FUNCTION public.generate_forest_occurrence_number();
CREATE TRIGGER trg_occ_updated_at BEFORE UPDATE ON public.forest_occurrences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.forest_occurrences ENABLE ROW LEVEL SECURITY;
CREATE POLICY occ_select ON public.forest_occurrences FOR SELECT
  USING (public.is_national_level(auth.uid()) OR public.can_access_province(province_id));
CREATE POLICY occ_insert ON public.forest_occurrences FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY occ_update ON public.forest_occurrences FOR UPDATE
  USING (public.is_technician_or_admin(auth.uid()));

-- ============ Companion Devices ============
CREATE TABLE IF NOT EXISTS public.companion_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name TEXT NOT NULL,
  device_serial TEXT UNIQUE,
  api_key_hash TEXT NOT NULL,
  capabilities TEXT[] DEFAULT '{}',
  assigned_to UUID,
  province_id UUID REFERENCES public.provinces(id),
  status TEXT NOT NULL DEFAULT 'active',
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_companion_updated_at BEFORE UPDATE ON public.companion_devices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.companion_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY companion_admin ON public.companion_devices FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ============ Biometria de Operadores ============
CREATE TABLE IF NOT EXISTS public.operator_biometrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES public.forest_operators(id) ON DELETE CASCADE,
  finger_position TEXT NOT NULL,
  template_data TEXT NOT NULL,
  quality_score INTEGER,
  captured_by UUID,
  device_id UUID REFERENCES public.companion_devices(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.operator_biometrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY biom_read ON public.operator_biometrics FOR SELECT
  USING (public.is_technician_or_admin(auth.uid()));
CREATE POLICY biom_write ON public.operator_biometrics FOR INSERT
  WITH CHECK (public.is_technician_or_admin(auth.uid()));

-- ============ Cartões NFC ============
CREATE TABLE IF NOT EXISTS public.operator_nfc_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID REFERENCES public.forest_operators(id) ON DELETE CASCADE,
  nfc_uid TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT nfc_uid_format CHECK (nfc_uid ~* '^[0-9A-F]{2}(:[0-9A-F]{2}){3,9}$|^[0-9A-F]{8,20}$')
);
CREATE TRIGGER trg_nfc_updated_at BEFORE UPDATE ON public.operator_nfc_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.operator_nfc_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY nfc_read ON public.operator_nfc_cards FOR SELECT
  USING (public.is_technician_or_admin(auth.uid()));
CREATE POLICY nfc_write ON public.operator_nfc_cards FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY nfc_update ON public.operator_nfc_cards FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- ============ Field Captures (audit log) ============
CREATE TABLE IF NOT EXISTS public.field_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.companion_devices(id),
  operator_id UUID REFERENCES public.forest_operators(id),
  capture_type TEXT NOT NULL,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  match_score NUMERIC(5,2),
  raw_payload JSONB,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.field_captures ENABLE ROW LEVEL SECURITY;
CREATE POLICY fc_read ON public.field_captures FOR SELECT
  USING (public.is_admin(auth.uid()));
-- INSERT only via service role (edge function companion-ingest)

-- ============ Storage buckets ============
INSERT INTO storage.buckets (id, name, public) VALUES ('operator-documents', 'operator-documents', false)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('license-documents', 'license-documents', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "operator_docs_admin_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'operator-documents' AND public.is_technician_or_admin(auth.uid()));
CREATE POLICY "operator_docs_admin_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'operator-documents' AND public.is_technician_or_admin(auth.uid()));
CREATE POLICY "license_docs_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'license-documents');
CREATE POLICY "license_docs_admin_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'license-documents' AND public.is_technician_or_admin(auth.uid()));
