
-- Table: farmer_representatives
CREATE TABLE public.farmer_representatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bi TEXT,
  phone TEXT,
  relationship TEXT NOT NULL,
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  photo_url TEXT,
  fingerprint_complete BOOLEAN DEFAULT false,
  fingers_captured INTEGER DEFAULT 0,
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_farmer_representatives_farmer ON public.farmer_representatives(farmer_id);
CREATE INDEX idx_farmer_representatives_bi ON public.farmer_representatives(bi);

ALTER TABLE public.farmer_representatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians and admins can manage representatives"
  ON public.farmer_representatives FOR ALL
  TO authenticated
  USING (public.is_technician_or_admin(auth.uid()))
  WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Viewers can read representatives"
  ON public.farmer_representatives FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_farmer_representatives_updated_at
  BEFORE UPDATE ON public.farmer_representatives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table: farmer_parcels
CREATE TABLE public.farmer_parcels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  commune_id UUID REFERENCES public.communes(id),
  area_ha NUMERIC(10,2),
  main_crop TEXT,
  crops TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  latitude NUMERIC(10,6),
  longitude NUMERIC(10,6),
  soil_type TEXT,
  water_source TEXT,
  irrigation_system TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_farmer_parcels_farmer ON public.farmer_parcels(farmer_id);
CREATE INDEX idx_farmer_parcels_status ON public.farmer_parcels(status);

ALTER TABLE public.farmer_parcels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians and admins can manage parcels"
  ON public.farmer_parcels FOR ALL
  TO authenticated
  USING (public.is_technician_or_admin(auth.uid()))
  WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Viewers can read parcels"
  ON public.farmer_parcels FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_farmer_parcels_updated_at
  BEFORE UPDATE ON public.farmer_parcels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table: parcel_polygons
CREATE TABLE public.parcel_polygons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parcel_id UUID NOT NULL REFERENCES public.farmer_parcels(id) ON DELETE CASCADE,
  polygon JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_parcel_polygons_parcel ON public.parcel_polygons(parcel_id);

ALTER TABLE public.parcel_polygons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians and admins can manage polygons"
  ON public.parcel_polygons FOR ALL
  TO authenticated
  USING (public.is_technician_or_admin(auth.uid()))
  WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Viewers can read polygons"
  ON public.parcel_polygons FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_parcel_polygons_updated_at
  BEFORE UPDATE ON public.parcel_polygons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table: farmer_campaigns
CREATE TABLE public.farmer_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  parcel_id UUID REFERENCES public.farmer_parcels(id) ON DELETE SET NULL,
  crop TEXT NOT NULL,
  current_phase INTEGER NOT NULL DEFAULT 1,
  total_phases INTEGER NOT NULL DEFAULT 10,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_harvest DATE,
  status TEXT NOT NULL DEFAULT 'in_progress',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_farmer_campaigns_farmer ON public.farmer_campaigns(farmer_id);
CREATE INDEX idx_farmer_campaigns_status ON public.farmer_campaigns(status);

ALTER TABLE public.farmer_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians and admins can manage campaigns"
  ON public.farmer_campaigns FOR ALL
  TO authenticated
  USING (public.is_technician_or_admin(auth.uid()))
  WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Viewers can read campaigns"
  ON public.farmer_campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE TRIGGER update_farmer_campaigns_updated_at
  BEFORE UPDATE ON public.farmer_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
