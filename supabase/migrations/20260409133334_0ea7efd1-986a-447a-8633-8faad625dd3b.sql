
-- Create field_technicians table
CREATE TABLE public.field_technicians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  specialization TEXT DEFAULT 'general',
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  status TEXT NOT NULL DEFAULT 'active',
  max_farmers INTEGER DEFAULT 150,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add technician_id to farmers
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS technician_id UUID REFERENCES public.field_technicians(id);

-- Enable RLS
ALTER TABLE public.field_technicians ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Technicians and admins can view technicians"
  ON public.field_technicians FOR SELECT
  TO authenticated
  USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Admins can insert technicians"
  ON public.field_technicians FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update technicians"
  ON public.field_technicians FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete technicians"
  ON public.field_technicians FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Auto-generate employee number
CREATE OR REPLACE FUNCTION public.generate_technician_number()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public'
AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  SELECT COALESCE(MAX(CAST(SUBSTRING(employee_number FROM 5) AS INTEGER)), 0) + 1
    INTO v_seq
    FROM public.field_technicians
    WHERE employee_number LIKE 'TEC-' || v_year || '-%';
  NEW.employee_number := 'TEC-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_technician_number
  BEFORE INSERT ON public.field_technicians
  FOR EACH ROW
  WHEN (NEW.employee_number IS NULL OR NEW.employee_number = '')
  EXECUTE FUNCTION public.generate_technician_number();

-- Updated_at trigger
CREATE TRIGGER update_field_technicians_updated_at
  BEFORE UPDATE ON public.field_technicians
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for lookups
CREATE INDEX idx_field_technicians_province ON public.field_technicians(province_id);
CREATE INDEX idx_field_technicians_municipality ON public.field_technicians(municipality_id);
CREATE INDEX idx_farmers_technician ON public.farmers(technician_id);
