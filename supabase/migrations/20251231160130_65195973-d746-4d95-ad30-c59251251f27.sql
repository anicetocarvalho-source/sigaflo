-- Create coffee_lots table
CREATE TABLE public.coffee_lots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lot_code VARCHAR(50) NOT NULL UNIQUE,
  origin_province_id UUID REFERENCES public.provinces(id),
  origin_municipality_id UUID REFERENCES public.municipalities(id),
  origin_commune_id UUID REFERENCES public.communes(id),
  origin_location TEXT,
  producers_count INTEGER DEFAULT 0,
  volume_kg NUMERIC(12, 2) NOT NULL DEFAULT 0,
  bags_count INTEGER DEFAULT 0,
  variety VARCHAR(100),
  quality_grade VARCHAR(50),
  harvest_year INTEGER,
  harvest_season VARCHAR(50),
  processing_method VARCHAR(100),
  exporter_id UUID REFERENCES public.forest_operators(id),
  exporter_name VARCHAR(255),
  buyer_name VARCHAR(255),
  destination_country VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'registered',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  dispatched_at TIMESTAMP WITH TIME ZONE,
  exported_at TIMESTAMP WITH TIME ZONE,
  export_declaration_number VARCHAR(100),
  transport_document_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Add comments
COMMENT ON TABLE public.coffee_lots IS 'Coffee lots for INCA module tracking';
COMMENT ON COLUMN public.coffee_lots.status IS 'Status: registered, in_processing, in_transit, exported, rejected';

-- Enable RLS
ALTER TABLE public.coffee_lots ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for authenticated users" 
ON public.coffee_lots 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow insert for authenticated users" 
ON public.coffee_lots 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users" 
ON public.coffee_lots 
FOR UPDATE 
TO authenticated
USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_coffee_lots_updated_at
BEFORE UPDATE ON public.coffee_lots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for common queries
CREATE INDEX idx_coffee_lots_status ON public.coffee_lots(status);
CREATE INDEX idx_coffee_lots_origin_province ON public.coffee_lots(origin_province_id);
CREATE INDEX idx_coffee_lots_exporter ON public.coffee_lots(exporter_id);
CREATE INDEX idx_coffee_lots_lot_code ON public.coffee_lots(lot_code);

-- Insert sample data
INSERT INTO public.coffee_lots (lot_code, origin_location, producers_count, volume_kg, bags_count, variety, quality_grade, harvest_year, status, exporter_name, destination_country) VALUES
('CAFE-2024-001', 'Uíge, Negage', 45, 2500, 42, 'Robusta', 'Grade A', 2024, 'exported', 'Angola Coffee Export Ltd', 'Portugal'),
('CAFE-2024-002', 'Cuanza Sul, Waku Kungo', 32, 1800, 30, 'Arábica', 'Premium', 2024, 'in_transit', 'Café de Angola SA', 'Alemanha'),
('CAFE-2024-003', 'Benguela, Ganda', 28, 1200, 20, 'Robusta', 'Grade B', 2024, 'in_transit', 'Angola Coffee Export Ltd', 'Itália'),
('CAFE-2024-004', 'Huambo, Bailundo', 56, 3200, 53, 'Arábica', 'Specialty', 2024, 'registered', 'Premium Coffee Angola', 'EUA'),
('CAFE-2024-005', 'Uíge, Songo', 38, 2100, 35, 'Robusta', 'Grade A', 2024, 'registered', 'Café de Angola SA', 'França');