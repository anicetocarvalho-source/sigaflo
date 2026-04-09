
-- Monitoring alerts
CREATE TABLE public.monitoring_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  alert_type TEXT NOT NULL DEFAULT 'climate',
  severity TEXT NOT NULL DEFAULT 'medium',
  source TEXT NOT NULL DEFAULT 'manual',
  source_phone TEXT,
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  commune_id UUID REFERENCES public.communes(id),
  latitude NUMERIC,
  longitude NUMERIC,
  affected_area_ha NUMERIC,
  affected_farmers_count INTEGER DEFAULT 0,
  response_status TEXT NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SMS received
CREATE TABLE public.sms_received (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_phone TEXT NOT NULL,
  raw_message TEXT NOT NULL,
  parsed_data JSONB,
  ai_interpretation TEXT,
  alert_id UUID REFERENCES public.monitoring_alerts(id),
  province_id UUID REFERENCES public.provinces(id),
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SMS sent
CREATE TABLE public.sms_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_phone TEXT NOT NULL,
  template_code TEXT,
  message_text TEXT NOT NULL,
  target_zone TEXT,
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  sent_by UUID REFERENCES auth.users(id),
  delivery_status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agricultural scores
CREATE TABLE public.agricultural_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  season TEXT NOT NULL,
  planting_score NUMERIC DEFAULT 0,
  package_score NUMERIC DEFAULT 0,
  mechanization_score NUMERIC DEFAULT 0,
  production_score NUMERIC DEFAULT 0,
  total_score NUMERIC DEFAULT 0,
  compliance_level TEXT DEFAULT 'low',
  notes TEXT,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  calculated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(farmer_id, season)
);

-- NDVI readings (without parcels FK since table doesn't exist yet)
CREATE TABLE public.ndvi_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL,
  ndvi_value NUMERIC NOT NULL,
  stress_level TEXT DEFAULT 'normal',
  source TEXT DEFAULT 'MODIS',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_received ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agricultural_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ndvi_readings ENABLE ROW LEVEL SECURITY;

-- RLS: monitoring_alerts
CREATE POLICY "Tech and admin can view alerts" ON public.monitoring_alerts FOR SELECT TO authenticated USING (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can insert alerts" ON public.monitoring_alerts FOR INSERT TO authenticated WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can update alerts" ON public.monitoring_alerts FOR UPDATE TO authenticated USING (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Admin can delete alerts" ON public.monitoring_alerts FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- RLS: sms_received
CREATE POLICY "Tech and admin can view sms_received" ON public.sms_received FOR SELECT TO authenticated USING (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can insert sms_received" ON public.sms_received FOR INSERT TO authenticated WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can update sms_received" ON public.sms_received FOR UPDATE TO authenticated USING (public.is_technician_or_admin(auth.uid()));

-- RLS: sms_sent
CREATE POLICY "Tech and admin can view sms_sent" ON public.sms_sent FOR SELECT TO authenticated USING (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can insert sms_sent" ON public.sms_sent FOR INSERT TO authenticated WITH CHECK (public.is_technician_or_admin(auth.uid()));

-- RLS: agricultural_scores
CREATE POLICY "Tech and admin can view scores" ON public.agricultural_scores FOR SELECT TO authenticated USING (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can insert scores" ON public.agricultural_scores FOR INSERT TO authenticated WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can update scores" ON public.agricultural_scores FOR UPDATE TO authenticated USING (public.is_technician_or_admin(auth.uid()));

-- RLS: ndvi_readings
CREATE POLICY "Tech and admin can view ndvi" ON public.ndvi_readings FOR SELECT TO authenticated USING (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Tech and admin can insert ndvi" ON public.ndvi_readings FOR INSERT TO authenticated WITH CHECK (public.is_technician_or_admin(auth.uid()));

-- Auto-generate alert number
CREATE OR REPLACE FUNCTION public.generate_alert_number()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  SELECT COALESCE(MAX(CAST(SUBSTRING(alert_number FROM 5) AS INTEGER)), 0) + 1
    INTO v_seq
    FROM public.monitoring_alerts
    WHERE alert_number LIKE 'ALR-' || v_year || '-%';
  NEW.alert_number := 'ALR-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_alert_number
  BEFORE INSERT ON public.monitoring_alerts
  FOR EACH ROW
  WHEN (NEW.alert_number IS NULL OR NEW.alert_number = '')
  EXECUTE FUNCTION public.generate_alert_number();

-- Updated_at triggers
CREATE TRIGGER update_monitoring_alerts_updated_at BEFORE UPDATE ON public.monitoring_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agricultural_scores_updated_at BEFORE UPDATE ON public.agricultural_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_monitoring_alerts_province ON public.monitoring_alerts(province_id);
CREATE INDEX idx_monitoring_alerts_severity ON public.monitoring_alerts(severity);
CREATE INDEX idx_monitoring_alerts_status ON public.monitoring_alerts(response_status);
CREATE INDEX idx_sms_received_processed ON public.sms_received(processed);
CREATE INDEX idx_agricultural_scores_farmer ON public.agricultural_scores(farmer_id);
CREATE INDEX idx_agricultural_scores_season ON public.agricultural_scores(season);
CREATE INDEX idx_ndvi_readings_farmer ON public.ndvi_readings(farmer_id);
CREATE INDEX idx_ndvi_readings_date ON public.ndvi_readings(reading_date);
