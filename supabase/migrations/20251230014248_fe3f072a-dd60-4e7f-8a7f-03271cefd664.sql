-- Rice Production Table (National production data by province/year)
CREATE TABLE public.rice_production (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  year INTEGER NOT NULL,
  season TEXT NOT NULL DEFAULT 'principal', -- 'principal' or 'secundaria'
  cultivated_area_ha NUMERIC NOT NULL DEFAULT 0,
  harvested_area_ha NUMERIC NOT NULL DEFAULT 0,
  production_tonnes NUMERIC NOT NULL DEFAULT 0,
  productivity_kg_ha NUMERIC GENERATED ALWAYS AS (
    CASE WHEN harvested_area_ha > 0 THEN (production_tonnes * 1000) / harvested_area_ha ELSE 0 END
  ) STORED,
  variety TEXT,
  irrigation_type TEXT, -- 'sequeiro', 'irrigado', 'varzea'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(province_id, year, season)
);

-- Rice Imports Table
CREATE TABLE public.rice_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  origin_country TEXT NOT NULL,
  volume_tonnes NUMERIC NOT NULL DEFAULT 0,
  price_cif_usd NUMERIC, -- Cost, Insurance, Freight per tonne
  price_fob_usd NUMERIC, -- Free on Board per tonne
  total_value_usd NUMERIC,
  importer_name TEXT,
  port_of_entry TEXT,
  rice_type TEXT, -- 'branco', 'parboilizado', 'integral'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Rice Prices Table (Internal market prices)
CREATE TABLE public.rice_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province_id UUID REFERENCES public.provinces(id),
  recorded_date DATE NOT NULL,
  retail_price_aoa NUMERIC NOT NULL, -- Price per kg at retail
  wholesale_price_aoa NUMERIC, -- Price per kg at wholesale
  rice_type TEXT DEFAULT 'branco', -- 'branco', 'parboilizado', 'local'
  market_name TEXT,
  currency TEXT DEFAULT 'AOA',
  exchange_rate_usd NUMERIC, -- AOA to USD rate at time of recording
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Rice Consumption Data
CREATE TABLE public.rice_consumption (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  province_id UUID REFERENCES public.provinces(id), -- NULL for national level
  population NUMERIC NOT NULL,
  per_capita_kg NUMERIC NOT NULL, -- Annual per capita consumption in kg
  total_consumption_tonnes NUMERIC GENERATED ALWAYS AS (
    (population * per_capita_kg) / 1000
  ) STORED,
  data_source TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(year, province_id)
);

-- Rice Alerts Table
CREATE TABLE public.rice_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL, -- 'price_spike', 'import_surge', 'production_drop', 'stock_low', 'gap_increase'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metric_name TEXT,
  current_value NUMERIC,
  threshold_value NUMERIC,
  province_id UUID REFERENCES public.provinces(id),
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rice Strategic Parameters (for simulations)
CREATE TABLE public.rice_parameters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parameter_name TEXT NOT NULL UNIQUE,
  parameter_value NUMERIC NOT NULL,
  unit TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID
);

-- Enable RLS on all tables
ALTER TABLE public.rice_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rice_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rice_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rice_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rice_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rice_parameters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rice_production
CREATE POLICY "Rice production viewable by authenticated" ON public.rice_production
  FOR SELECT USING (true);
CREATE POLICY "Rice production editable by authenticated" ON public.rice_production
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Rice production updatable by authenticated" ON public.rice_production
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for rice_imports
CREATE POLICY "Rice imports viewable by authenticated" ON public.rice_imports
  FOR SELECT USING (true);
CREATE POLICY "Rice imports editable by authenticated" ON public.rice_imports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Rice imports updatable by authenticated" ON public.rice_imports
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for rice_prices
CREATE POLICY "Rice prices viewable by authenticated" ON public.rice_prices
  FOR SELECT USING (true);
CREATE POLICY "Rice prices editable by authenticated" ON public.rice_prices
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for rice_consumption
CREATE POLICY "Rice consumption viewable by authenticated" ON public.rice_consumption
  FOR SELECT USING (true);
CREATE POLICY "Rice consumption editable by authenticated" ON public.rice_consumption
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Rice consumption updatable by authenticated" ON public.rice_consumption
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for rice_alerts
CREATE POLICY "Rice alerts viewable by authenticated" ON public.rice_alerts
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Rice alerts editable by authenticated" ON public.rice_alerts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Rice alerts updatable by authenticated" ON public.rice_alerts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for rice_parameters
CREATE POLICY "Rice parameters viewable by authenticated" ON public.rice_parameters
  FOR SELECT USING (true);
CREATE POLICY "Rice parameters editable by admins" ON public.rice_parameters
  FOR ALL USING (is_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_rice_production_updated_at
  BEFORE UPDATE ON public.rice_production
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rice_imports_updated_at
  BEFORE UPDATE ON public.rice_imports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rice_consumption_updated_at
  BEFORE UPDATE ON public.rice_consumption
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default strategic parameters
INSERT INTO public.rice_parameters (parameter_name, parameter_value, unit, description) VALUES
  ('target_self_sufficiency', 30, '%', 'Meta de autossuficiência em arroz até 2030'),
  ('avg_per_capita_consumption', 25, 'kg/ano', 'Consumo médio per capita anual'),
  ('import_reduction_target', 50, '%', 'Meta de redução de importações até 2030'),
  ('price_alert_threshold', 15, '%', 'Limiar para alerta de variação de preço'),
  ('current_population', 35000000, 'habitantes', 'População estimada atual'),
  ('productivity_target', 4500, 'kg/ha', 'Meta de produtividade média');

-- Create indexes for performance
CREATE INDEX idx_rice_production_year ON public.rice_production(year);
CREATE INDEX idx_rice_production_province ON public.rice_production(province_id);
CREATE INDEX idx_rice_imports_year_month ON public.rice_imports(year, month);
CREATE INDEX idx_rice_prices_date ON public.rice_prices(recorded_date);
CREATE INDEX idx_rice_alerts_created ON public.rice_alerts(created_at DESC);
CREATE INDEX idx_rice_alerts_unread ON public.rice_alerts(is_read) WHERE is_read = false;