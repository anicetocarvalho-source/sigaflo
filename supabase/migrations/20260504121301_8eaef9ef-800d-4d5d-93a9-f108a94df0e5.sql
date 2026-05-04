-- =============================================================================
-- file_integrity: metadados de integridade de uploads (SHA-256)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.file_integrity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL,
  path TEXT NOT NULL,
  sha256 CHAR(64) NOT NULL,
  mime TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  entity_type TEXT,
  entity_id UUID,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bucket, path)
);

CREATE INDEX IF NOT EXISTS idx_file_integrity_entity
  ON public.file_integrity (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_file_integrity_sha256
  ON public.file_integrity (sha256);

ALTER TABLE public.file_integrity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "file_integrity_insert_self" ON public.file_integrity;
CREATE POLICY "file_integrity_insert_self"
  ON public.file_integrity
  FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "file_integrity_select_owner_or_admin" ON public.file_integrity;
CREATE POLICY "file_integrity_select_owner_or_admin"
  ON public.file_integrity
  FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid() OR public.is_admin(auth.uid()));

-- =============================================================================
-- Validação + normalização de contactos (email/phone) — farmers, profiles
-- =============================================================================
CREATE OR REPLACE FUNCTION public.normalize_and_validate_contact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_phone TEXT;
  v_digits TEXT;
BEGIN
  -- EMAIL: trim + lower + regex
  IF NEW.email IS NOT NULL AND length(trim(NEW.email)) > 0 THEN
    v_email := lower(regexp_replace(NEW.email, '\s+', '', 'g'));
    IF v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' THEN
      RAISE EXCEPTION 'Email inválido: %', NEW.email
        USING ERRCODE = 'check_violation';
    END IF;
    NEW.email := v_email;
  ELSE
    NEW.email := NULL;
  END IF;

  -- PHONE: aceita variantes; normaliza para +244XXXXXXXXX
  IF NEW.phone IS NOT NULL AND length(trim(NEW.phone)) > 0 THEN
    v_digits := regexp_replace(NEW.phone, '\D', '', 'g');
    IF v_digits LIKE '00244%' THEN v_digits := substr(v_digits, 6); END IF;
    IF v_digits LIKE '244%' AND length(v_digits) = 12 THEN v_digits := substr(v_digits, 4); END IF;
    IF length(v_digits) <> 9 OR v_digits !~ '^(91|92|93|94|95|97|99)\d{7}$' THEN
      RAISE EXCEPTION 'Telefone móvel angolano inválido: %', NEW.phone
        USING ERRCODE = 'check_violation';
    END IF;
    NEW.phone := '+244' || v_digits;
  ELSE
    NEW.phone := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_farmers_normalize_contact ON public.farmers;
CREATE TRIGGER tg_farmers_normalize_contact
  BEFORE INSERT OR UPDATE OF email, phone ON public.farmers
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_and_validate_contact();

DROP TRIGGER IF EXISTS tg_profiles_normalize_contact ON public.profiles;
CREATE TRIGGER tg_profiles_normalize_contact
  BEFORE INSERT OR UPDATE OF email, phone ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_and_validate_contact();