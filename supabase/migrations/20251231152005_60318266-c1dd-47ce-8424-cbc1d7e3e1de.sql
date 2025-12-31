-- Create forest inventory table
CREATE TABLE public.forest_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_code VARCHAR(50) NOT NULL UNIQUE,
  license_id UUID REFERENCES public.forest_licenses(id),
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  concession_name VARCHAR(255) NOT NULL,
  
  -- Area and classification
  total_area_ha NUMERIC(12, 2) NOT NULL DEFAULT 0,
  forest_type VARCHAR(100) NOT NULL, -- 'tropical_humid', 'tropical_dry', 'miombo', 'mangrove', 'plantation', 'gallery'
  forest_status VARCHAR(50) NOT NULL DEFAULT 'conservation', -- 'exploitation', 'conservation', 'protection', 'restoration'
  exploitation_status VARCHAR(50) DEFAULT 'inactive', -- 'active', 'inactive', 'suspended', 'completed'
  
  -- Species and resources
  dominant_species TEXT[] DEFAULT '{}',
  estimated_standing_volume_m3 NUMERIC(12, 2),
  harvestable_volume_m3 NUMERIC(12, 2),
  harvested_volume_m3 NUMERIC(12, 2) DEFAULT 0,
  
  -- Reposition and sustainability
  annual_allowable_cut_m3 NUMERIC(12, 2),
  reposition_rate_pct NUMERIC(5, 2) DEFAULT 0, -- Reforestation rate
  trees_planted INTEGER DEFAULT 0,
  trees_required INTEGER DEFAULT 0,
  
  -- Geolocation
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  boundary_geojson JSONB,
  
  -- Metadata
  last_inventory_date DATE,
  next_inventory_date DATE,
  inventory_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.forest_inventory ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view forest inventory" 
ON public.forest_inventory 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert forest inventory" 
ON public.forest_inventory 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update forest inventory" 
ON public.forest_inventory 
FOR UPDATE 
TO authenticated
USING (true);

-- Create indexes
CREATE INDEX idx_forest_inventory_province ON public.forest_inventory(province_id);
CREATE INDEX idx_forest_inventory_status ON public.forest_inventory(forest_status);
CREATE INDEX idx_forest_inventory_type ON public.forest_inventory(forest_type);
CREATE INDEX idx_forest_inventory_license ON public.forest_inventory(license_id);

-- Add trigger for updated_at
CREATE TRIGGER update_forest_inventory_updated_at
BEFORE UPDATE ON public.forest_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.forest_inventory (
  inventory_code, concession_name, province_id, total_area_ha, 
  forest_type, forest_status, exploitation_status,
  dominant_species, estimated_standing_volume_m3, harvestable_volume_m3,
  annual_allowable_cut_m3, reposition_rate_pct, trees_planted, trees_required,
  latitude, longitude, last_inventory_date
) 
SELECT 
  'INV-' || p.code || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY p.name)::TEXT, 3, '0'),
  'Concessão Florestal ' || p.name || ' ' || (ROW_NUMBER() OVER (ORDER BY p.name)),
  p.id,
  (RANDOM() * 50000 + 10000)::NUMERIC(12,2),
  CASE (RANDOM() * 5)::INT
    WHEN 0 THEN 'tropical_humid'
    WHEN 1 THEN 'tropical_dry'
    WHEN 2 THEN 'miombo'
    WHEN 3 THEN 'mangrove'
    WHEN 4 THEN 'plantation'
    ELSE 'gallery'
  END,
  CASE (RANDOM() * 3)::INT
    WHEN 0 THEN 'exploitation'
    WHEN 1 THEN 'conservation'
    WHEN 2 THEN 'protection'
    ELSE 'restoration'
  END,
  CASE (RANDOM() * 3)::INT
    WHEN 0 THEN 'active'
    WHEN 1 THEN 'inactive'
    WHEN 2 THEN 'suspended'
    ELSE 'completed'
  END,
  ARRAY['Umbila', 'Girassonde', 'Muvuca', 'Chanfuta'],
  (RANDOM() * 100000 + 20000)::NUMERIC(12,2),
  (RANDOM() * 50000 + 10000)::NUMERIC(12,2),
  (RANDOM() * 5000 + 1000)::NUMERIC(12,2),
  (RANDOM() * 80 + 20)::NUMERIC(5,2),
  (RANDOM() * 50000 + 10000)::INT,
  (RANDOM() * 100000 + 20000)::INT,
  CASE p.code
    WHEN 'HUA' THEN -12.8
    WHEN 'BIE' THEN -12.4
    WHEN 'LNO' THEN -7.2
    WHEN 'LSU' THEN -9.5
    WHEN 'MOX' THEN -11.4
    ELSE -10.0 + RANDOM() * 5
  END,
  CASE p.code
    WHEN 'HUA' THEN 15.5
    WHEN 'BIE' THEN 17.1
    WHEN 'LNO' THEN 20.4
    WHEN 'LSU' THEN 14.9
    WHEN 'MOX' THEN 21.4
    ELSE 14.0 + RANDOM() * 8
  END,
  NOW() - (RANDOM() * 365)::INT * INTERVAL '1 day'
FROM public.provinces p
WHERE p.code IN ('HUA', 'BIE', 'LNO', 'LSU', 'MOX', 'UIG', 'CNO', 'ZAI', 'MAL')
LIMIT 15;