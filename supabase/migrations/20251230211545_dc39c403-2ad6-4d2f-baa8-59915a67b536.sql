-- Climate/Phytosanitary Occurrences table
CREATE TABLE public.climate_occurrences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  occurrence_type TEXT NOT NULL CHECK (occurrence_type IN ('drought', 'flood', 'pest', 'disease', 'frost', 'hail', 'fire', 'other')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  commune_id UUID REFERENCES public.communes(id),
  latitude NUMERIC,
  longitude NUMERIC,
  affected_area_ha NUMERIC,
  affected_farmers_count INTEGER,
  estimated_loss_aoa NUMERIC,
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'confirmed', 'mitigating', 'resolved')),
  source TEXT NOT NULL DEFAULT 'backoffice' CHECK (source IN ('backoffice', 'sms', 'ivr', 'mobile_app')),
  source_phone TEXT,
  ai_classification JSONB,
  best_practices TEXT[],
  report_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolution_date TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  reported_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Occurrence outbound alerts
CREATE TABLE public.occurrence_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  occurrence_id UUID NOT NULL REFERENCES public.climate_occurrences(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('sms', 'email', 'push', 'ivr')),
  recipient_phone TEXT,
  recipient_email TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Occurrence surveys (SMS/IVR)
CREATE TABLE public.occurrence_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  occurrence_id UUID REFERENCES public.climate_occurrences(id) ON DELETE SET NULL,
  survey_type TEXT NOT NULL CHECK (survey_type IN ('impact_assessment', 'damage_report', 'recovery_status', 'needs_assessment')),
  target_phone TEXT NOT NULL,
  farmer_id UUID REFERENCES public.farmers(id),
  province_id UUID REFERENCES public.provinces(id),
  questions JSONB NOT NULL,
  responses JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'in_progress', 'completed', 'expired')),
  sent_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Risk metrics by province (materialized for dashboard)
CREATE TABLE public.province_risk_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province_id UUID NOT NULL REFERENCES public.provinces(id),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_occurrences INTEGER DEFAULT 0,
  critical_occurrences INTEGER DEFAULT 0,
  high_occurrences INTEGER DEFAULT 0,
  medium_occurrences INTEGER DEFAULT 0,
  low_occurrences INTEGER DEFAULT 0,
  total_affected_area_ha NUMERIC DEFAULT 0,
  total_affected_farmers INTEGER DEFAULT 0,
  total_estimated_loss_aoa NUMERIC DEFAULT 0,
  risk_score NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(province_id, year, month)
);

-- Enable RLS
ALTER TABLE public.climate_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occurrence_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occurrence_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.province_risk_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for climate_occurrences
CREATE POLICY "Occurrences viewable by authenticated" ON public.climate_occurrences
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Occurrences insertable by authenticated" ON public.climate_occurrences
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Occurrences updatable by authenticated" ON public.climate_occurrences
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for occurrence_alerts
CREATE POLICY "Alerts viewable by authenticated" ON public.occurrence_alerts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Alerts insertable by authenticated" ON public.occurrence_alerts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Alerts updatable by authenticated" ON public.occurrence_alerts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for occurrence_surveys
CREATE POLICY "Surveys viewable by authenticated" ON public.occurrence_surveys
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Surveys insertable by authenticated" ON public.occurrence_surveys
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Surveys updatable by authenticated" ON public.occurrence_surveys
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for province_risk_metrics
CREATE POLICY "Risk metrics viewable by authenticated" ON public.province_risk_metrics
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Risk metrics insertable by authenticated" ON public.province_risk_metrics
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Risk metrics updatable by authenticated" ON public.province_risk_metrics
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Function to calculate risk score
CREATE OR REPLACE FUNCTION public.calculate_risk_score(
  p_critical INTEGER,
  p_high INTEGER,
  p_medium INTEGER,
  p_low INTEGER,
  p_affected_area NUMERIC,
  p_affected_farmers INTEGER
) RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    (COALESCE(p_critical, 0) * 100) +
    (COALESCE(p_high, 0) * 50) +
    (COALESCE(p_medium, 0) * 20) +
    (COALESCE(p_low, 0) * 5) +
    (COALESCE(p_affected_area, 0) * 0.1) +
    (COALESCE(p_affected_farmers, 0) * 2)
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to update province risk metrics
CREATE OR REPLACE FUNCTION public.update_province_risk_metrics()
RETURNS TRIGGER AS $$
DECLARE
  v_year INTEGER;
  v_month INTEGER;
BEGIN
  v_year := EXTRACT(YEAR FROM COALESCE(NEW.report_date, OLD.report_date));
  v_month := EXTRACT(MONTH FROM COALESCE(NEW.report_date, OLD.report_date));
  
  INSERT INTO public.province_risk_metrics (
    province_id, year, month,
    total_occurrences, critical_occurrences, high_occurrences,
    medium_occurrences, low_occurrences, total_affected_area_ha,
    total_affected_farmers, total_estimated_loss_aoa, risk_score
  )
  SELECT 
    COALESCE(NEW.province_id, OLD.province_id),
    v_year,
    v_month,
    COUNT(*),
    COUNT(*) FILTER (WHERE severity = 'critical'),
    COUNT(*) FILTER (WHERE severity = 'high'),
    COUNT(*) FILTER (WHERE severity = 'medium'),
    COUNT(*) FILTER (WHERE severity = 'low'),
    COALESCE(SUM(affected_area_ha), 0),
    COALESCE(SUM(affected_farmers_count), 0),
    COALESCE(SUM(estimated_loss_aoa), 0),
    public.calculate_risk_score(
      COUNT(*) FILTER (WHERE severity = 'critical')::INTEGER,
      COUNT(*) FILTER (WHERE severity = 'high')::INTEGER,
      COUNT(*) FILTER (WHERE severity = 'medium')::INTEGER,
      COUNT(*) FILTER (WHERE severity = 'low')::INTEGER,
      COALESCE(SUM(affected_area_ha), 0),
      COALESCE(SUM(affected_farmers_count), 0)::INTEGER
    )
  FROM public.climate_occurrences
  WHERE province_id = COALESCE(NEW.province_id, OLD.province_id)
    AND EXTRACT(YEAR FROM report_date) = v_year
    AND EXTRACT(MONTH FROM report_date) = v_month
  ON CONFLICT (province_id, year, month) DO UPDATE SET
    total_occurrences = EXCLUDED.total_occurrences,
    critical_occurrences = EXCLUDED.critical_occurrences,
    high_occurrences = EXCLUDED.high_occurrences,
    medium_occurrences = EXCLUDED.medium_occurrences,
    low_occurrences = EXCLUDED.low_occurrences,
    total_affected_area_ha = EXCLUDED.total_affected_area_ha,
    total_affected_farmers = EXCLUDED.total_affected_farmers,
    total_estimated_loss_aoa = EXCLUDED.total_estimated_loss_aoa,
    risk_score = EXCLUDED.risk_score,
    updated_at = now();
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_risk_metrics
  AFTER INSERT OR UPDATE OR DELETE ON public.climate_occurrences
  FOR EACH ROW EXECUTE FUNCTION public.update_province_risk_metrics();

-- Updated_at trigger for climate_occurrences
CREATE TRIGGER update_climate_occurrences_updated_at
  BEFORE UPDATE ON public.climate_occurrences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();