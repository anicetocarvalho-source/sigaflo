
-- Enums
CREATE TYPE public.import_person_type AS ENUM ('singular', 'colectiva');
CREATE TYPE public.import_license_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'issued', 'rejected', 'expired', 'revoked');
CREATE TYPE public.import_product_category AS ENUM ('madeira', 'sementes', 'mudas', 'fertilizantes', 'pesticidas', 'equipamento', 'racao', 'outro');

-- Table
CREATE TABLE public.forest_import_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_number TEXT UNIQUE,
  person_type public.import_person_type NOT NULL,
  importer_name TEXT NOT NULL,
  document_number TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  origin_country TEXT NOT NULL,
  entry_point TEXT,
  product_category public.import_product_category NOT NULL,
  product_description TEXT NOT NULL,
  quantity NUMERIC(14,3) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg',
  cif_value NUMERIC(14,2),
  currency TEXT DEFAULT 'USD',
  issue_date DATE,
  expiry_date DATE,
  status public.import_license_status NOT NULL DEFAULT 'draft',
  province_id UUID REFERENCES public.provinces(id),
  document_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fil_status ON public.forest_import_licenses(status);
CREATE INDEX idx_fil_person ON public.forest_import_licenses(person_type);
CREATE INDEX idx_fil_province ON public.forest_import_licenses(province_id);

-- Number generator
CREATE OR REPLACE FUNCTION public.generate_import_license_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_year TEXT; v_seq INTEGER;
BEGIN
  IF NEW.license_number IS NOT NULL THEN RETURN NEW; END IF;
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  SELECT COALESCE(MAX(CAST(SUBSTRING(license_number FROM 9) AS INTEGER)),0)+1
    INTO v_seq FROM public.forest_import_licenses
    WHERE license_number LIKE 'FIM-' || v_year || '-%';
  NEW.license_number := 'FIM-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_fil_number BEFORE INSERT ON public.forest_import_licenses
  FOR EACH ROW EXECUTE FUNCTION public.generate_import_license_number();

CREATE TRIGGER trg_fil_updated_at BEFORE UPDATE ON public.forest_import_licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Audit
CREATE OR REPLACE FUNCTION public.audit_forest_import_license()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_action TEXT; v_old JSONB; v_new JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN v_action := 'create'; v_new := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN v_action := 'update'; v_old := to_jsonb(OLD); v_new := to_jsonb(NEW);
  ELSE v_action := 'delete'; v_old := to_jsonb(OLD);
  END IF;
  INSERT INTO public.audit_log(entity_type, entity_id, action, old_values, new_values, user_id)
    VALUES ('forest_import_licenses', COALESCE(NEW.id, OLD.id), v_action, v_old, v_new, auth.uid());
  RETURN COALESCE(NEW, OLD);
END; $$;

CREATE TRIGGER trg_fil_audit AFTER INSERT OR UPDATE OR DELETE ON public.forest_import_licenses
  FOR EACH ROW EXECUTE FUNCTION public.audit_forest_import_license();

-- RLS
ALTER TABLE public.forest_import_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tecnicos veem licencas de importacao"
  ON public.forest_import_licenses FOR SELECT TO authenticated
  USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Tecnicos criam licencas de importacao"
  ON public.forest_import_licenses FOR INSERT TO authenticated
  WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Tecnicos actualizam licencas de importacao"
  ON public.forest_import_licenses FOR UPDATE TO authenticated
  USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Admins eliminam licencas de importacao"
  ON public.forest_import_licenses FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));
