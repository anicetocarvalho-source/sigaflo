
-- Incentive Programs table
CREATE TABLE public.incentive_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  program_type TEXT NOT NULL DEFAULT 'subsidy', -- subsidy, credit, tax_benefit, technical_support
  sector TEXT NOT NULL DEFAULT 'agriculture', -- agriculture, forestry, coffee, rice
  budget_aoa NUMERIC,
  allocated_aoa NUMERIC DEFAULT 0,
  disbursed_aoa NUMERIC DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, suspended, completed, cancelled
  target_beneficiaries INTEGER,
  actual_beneficiaries INTEGER DEFAULT 0,
  target_provinces UUID[],
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Eligibility Rules table
CREATE TABLE public.eligibility_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.incentive_programs(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- farmer_type, province, area_min, area_max, production_min, crop_type, certification, reputation_min
  operator TEXT NOT NULL DEFAULT 'equals', -- equals, not_equals, greater_than, less_than, contains, in_list
  value TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  weight INTEGER DEFAULT 1, -- for scoring
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Incentive Allocations table
CREATE TABLE public.incentive_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.incentive_programs(id),
  farmer_id UUID NOT NULL REFERENCES public.farmers(id),
  allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_aoa NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, disbursed, cancelled, returned
  eligibility_score NUMERIC,
  eligibility_details JSONB,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  disbursed_at TIMESTAMP WITH TIME ZONE,
  disbursement_reference TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Incentive Impact Tracking table
CREATE TABLE public.incentive_impacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  allocation_id UUID NOT NULL REFERENCES public.incentive_allocations(id),
  evaluation_date DATE NOT NULL,
  evaluation_type TEXT NOT NULL, -- baseline, midterm, final
  production_before_kg NUMERIC,
  production_after_kg NUMERIC,
  production_change_pct NUMERIC,
  area_before_ha NUMERIC,
  area_after_ha NUMERIC,
  area_change_pct NUMERIC,
  income_before_aoa NUMERIC,
  income_after_aoa NUMERIC,
  income_change_pct NUMERIC,
  jobs_created INTEGER DEFAULT 0,
  compliance_score NUMERIC, -- 0-100
  notes TEXT,
  evaluator_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Incentive Alerts table
CREATE TABLE public.incentive_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.incentive_programs(id),
  allocation_id UUID REFERENCES public.incentive_allocations(id),
  alert_type TEXT NOT NULL, -- no_impact, deviation, expiring, budget_exceeded, compliance_issue
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metric_name TEXT,
  expected_value NUMERIC,
  actual_value NUMERIC,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.incentive_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incentive_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incentive_impacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incentive_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for incentive_programs
CREATE POLICY "Incentive programs viewable by authenticated"
  ON public.incentive_programs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Incentive programs insertable by authenticated"
  ON public.incentive_programs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Incentive programs updatable by authenticated"
  ON public.incentive_programs FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for eligibility_rules
CREATE POLICY "Eligibility rules viewable by authenticated"
  ON public.eligibility_rules FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Eligibility rules insertable by authenticated"
  ON public.eligibility_rules FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Eligibility rules updatable by authenticated"
  ON public.eligibility_rules FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Eligibility rules deletable by authenticated"
  ON public.eligibility_rules FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for incentive_allocations
CREATE POLICY "Allocations viewable by authenticated"
  ON public.incentive_allocations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allocations insertable by authenticated"
  ON public.incentive_allocations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allocations updatable by authenticated"
  ON public.incentive_allocations FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for incentive_impacts
CREATE POLICY "Impacts viewable by authenticated"
  ON public.incentive_impacts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Impacts insertable by authenticated"
  ON public.incentive_impacts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for incentive_alerts
CREATE POLICY "Incentive alerts viewable by authenticated"
  ON public.incentive_alerts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Incentive alerts insertable by authenticated"
  ON public.incentive_alerts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Incentive alerts updatable by authenticated"
  ON public.incentive_alerts FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_incentive_programs_status ON public.incentive_programs(status);
CREATE INDEX idx_incentive_programs_sector ON public.incentive_programs(sector);
CREATE INDEX idx_eligibility_rules_program ON public.eligibility_rules(program_id);
CREATE INDEX idx_incentive_allocations_program ON public.incentive_allocations(program_id);
CREATE INDEX idx_incentive_allocations_farmer ON public.incentive_allocations(farmer_id);
CREATE INDEX idx_incentive_allocations_status ON public.incentive_allocations(status);
CREATE INDEX idx_incentive_impacts_allocation ON public.incentive_impacts(allocation_id);
CREATE INDEX idx_incentive_alerts_program ON public.incentive_alerts(program_id);
CREATE INDEX idx_incentive_alerts_resolved ON public.incentive_alerts(is_resolved);

-- Update trigger for programs
CREATE TRIGGER update_incentive_programs_updated_at
  BEFORE UPDATE ON public.incentive_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for allocations
CREATE TRIGGER update_incentive_allocations_updated_at
  BEFORE UPDATE ON public.incentive_allocations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
