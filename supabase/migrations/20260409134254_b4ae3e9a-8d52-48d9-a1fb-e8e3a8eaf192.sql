
-- Insurance quotes
CREATE TABLE public.insurance_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  area_ha NUMERIC NOT NULL,
  coverage_type TEXT NOT NULL DEFAULT 'parametric',
  sum_insured_aoa NUMERIC NOT NULL DEFAULT 0,
  premium_aoa NUMERIC NOT NULL DEFAULT 0,
  premium_rate NUMERIC DEFAULT 0,
  coverage_details JSONB,
  valid_until DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insurance policies
CREATE TABLE public.insurance_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_number TEXT NOT NULL UNIQUE,
  quote_id UUID REFERENCES public.insurance_quotes(id),
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  policy_type TEXT NOT NULL DEFAULT 'parametric',
  crop TEXT NOT NULL,
  area_ha NUMERIC NOT NULL,
  sum_insured_aoa NUMERIC NOT NULL DEFAULT 0,
  premium_aoa NUMERIC NOT NULL DEFAULT 0,
  coverage_start DATE NOT NULL,
  coverage_end DATE NOT NULL,
  coverage_details JSONB,
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  status TEXT NOT NULL DEFAULT 'active',
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insurance claims
CREATE TABLE public.insurance_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_number TEXT NOT NULL UNIQUE,
  policy_id UUID NOT NULL REFERENCES public.insurance_policies(id),
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  description TEXT,
  affected_area_ha NUMERIC,
  estimated_loss_aoa NUMERIC DEFAULT 0,
  approved_amount_aoa NUMERIC DEFAULT 0,
  evidence_urls TEXT[],
  gps_latitude NUMERIC,
  gps_longitude NUMERIC,
  ndvi_at_event NUMERIC,
  parametric_trigger TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  paid_at TIMESTAMPTZ,
  payment_reference TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Parametric rules
CREATE TABLE public.parametric_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL DEFAULT 'ndvi',
  crop TEXT,
  province_id UUID REFERENCES public.provinces(id),
  parameter TEXT NOT NULL,
  operator TEXT NOT NULL DEFAULT '<',
  threshold_value NUMERIC NOT NULL,
  payout_percentage NUMERIC NOT NULL DEFAULT 100,
  monitoring_period_days INTEGER DEFAULT 30,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.insurance_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parametric_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Tech and admin can view quotes" ON public.insurance_quotes FOR SELECT TO authenticated USING (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can insert quotes" ON public.insurance_quotes FOR INSERT TO authenticated WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can update quotes" ON public.insurance_quotes FOR UPDATE TO authenticated USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Tech and admin can view policies" ON public.insurance_policies FOR SELECT TO authenticated USING (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can insert policies" ON public.insurance_policies FOR INSERT TO authenticated WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can update policies" ON public.insurance_policies FOR UPDATE TO authenticated USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Tech and admin can view claims" ON public.insurance_claims FOR SELECT TO authenticated USING (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can insert claims" ON public.insurance_claims FOR INSERT TO authenticated WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can update claims" ON public.insurance_claims FOR UPDATE TO authenticated USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Tech and admin can view rules" ON public.parametric_rules FOR SELECT TO authenticated USING (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can insert rules" ON public.parametric_rules FOR INSERT TO authenticated WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can update rules" ON public.parametric_rules FOR UPDATE TO authenticated USING (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Admin can delete rules" ON public.parametric_rules FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- Auto-generate numbers
CREATE OR REPLACE FUNCTION public.generate_quote_number()
  RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
DECLARE v_year TEXT; v_seq INTEGER;
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 5) AS INTEGER)), 0) + 1
    INTO v_seq FROM public.insurance_quotes
    WHERE quote_number LIKE 'COT-' || v_year || '-%';
  NEW.quote_number := 'COT-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_generate_quote_number BEFORE INSERT ON public.insurance_quotes
  FOR EACH ROW WHEN (NEW.quote_number IS NULL OR NEW.quote_number = '')
  EXECUTE FUNCTION public.generate_quote_number();

CREATE OR REPLACE FUNCTION public.generate_policy_number()
  RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
DECLARE v_year TEXT; v_seq INTEGER;
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  SELECT COALESCE(MAX(CAST(SUBSTRING(policy_number FROM 5) AS INTEGER)), 0) + 1
    INTO v_seq FROM public.insurance_policies
    WHERE policy_number LIKE 'APL-' || v_year || '-%';
  NEW.policy_number := 'APL-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_generate_policy_number BEFORE INSERT ON public.insurance_policies
  FOR EACH ROW WHEN (NEW.policy_number IS NULL OR NEW.policy_number = '')
  EXECUTE FUNCTION public.generate_policy_number();

CREATE OR REPLACE FUNCTION public.generate_claim_number()
  RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
DECLARE v_year TEXT; v_seq INTEGER;
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  SELECT COALESCE(MAX(CAST(SUBSTRING(claim_number FROM 5) AS INTEGER)), 0) + 1
    INTO v_seq FROM public.insurance_claims
    WHERE claim_number LIKE 'SIN-' || v_year || '-%';
  NEW.claim_number := 'SIN-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_generate_claim_number BEFORE INSERT ON public.insurance_claims
  FOR EACH ROW WHEN (NEW.claim_number IS NULL OR NEW.claim_number = '')
  EXECUTE FUNCTION public.generate_claim_number();

-- Updated_at triggers
CREATE TRIGGER update_insurance_quotes_updated_at BEFORE UPDATE ON public.insurance_quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_insurance_policies_updated_at BEFORE UPDATE ON public.insurance_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_insurance_claims_updated_at BEFORE UPDATE ON public.insurance_claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_parametric_rules_updated_at BEFORE UPDATE ON public.parametric_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_insurance_quotes_farmer ON public.insurance_quotes(farmer_id);
CREATE INDEX idx_insurance_policies_farmer ON public.insurance_policies(farmer_id);
CREATE INDEX idx_insurance_policies_status ON public.insurance_policies(status);
CREATE INDEX idx_insurance_claims_policy ON public.insurance_claims(policy_id);
CREATE INDEX idx_insurance_claims_status ON public.insurance_claims(status);
CREATE INDEX idx_parametric_rules_type ON public.parametric_rules(rule_type);
