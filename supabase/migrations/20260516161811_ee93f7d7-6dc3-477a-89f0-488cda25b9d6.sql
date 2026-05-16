
CREATE TYPE public.tree_health_status AS ENUM ('saudavel', 'em_risco', 'doente', 'removida');

CREATE TABLE public.trees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfid_code TEXT NOT NULL UNIQUE,
  concession_id UUID REFERENCES public.forest_inventory(id) ON DELETE SET NULL,
  common_name TEXT,
  scientific_name TEXT,
  species TEXT,
  location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  planting_date DATE,
  status public.tree_health_status NOT NULL DEFAULT 'saudavel',
  height NUMERIC,
  trunk_diameter NUMERIC,
  notes TEXT,
  photo_url TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trees_rfid ON public.trees(rfid_code);
CREATE INDEX idx_trees_concession ON public.trees(concession_id);
CREATE INDEX idx_trees_status ON public.trees(status);

ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;

-- Public read (app via external link)
CREATE POLICY "Anyone can view trees"
ON public.trees FOR SELECT
USING (true);

-- Anyone (incl anon) can insert/update via the RFID app
CREATE POLICY "Anyone can insert trees"
ON public.trees FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update trees"
ON public.trees FOR UPDATE
USING (true);

CREATE POLICY "Authenticated can delete trees"
ON public.trees FOR DELETE
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE TRIGGER update_trees_updated_at
BEFORE UPDATE ON public.trees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
