
-- Mechanization Centers
CREATE TABLE public.mechanization_centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  center_type TEXT NOT NULL DEFAULT 'tractor_center',
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  commune_id UUID REFERENCES public.communes(id),
  latitude NUMERIC,
  longitude NUMERIC,
  address TEXT,
  total_machines INTEGER DEFAULT 0,
  operational_machines INTEGER DEFAULT 0,
  manager_name TEXT,
  manager_phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mechanization_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians and admins can view centers"
  ON public.mechanization_centers FOR SELECT TO authenticated
  USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Technicians and admins can create centers"
  ON public.mechanization_centers FOR INSERT TO authenticated
  WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Technicians and admins can update centers"
  ON public.mechanization_centers FOR UPDATE TO authenticated
  USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Admins can delete centers"
  ON public.mechanization_centers FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_mechanization_centers_updated_at
  BEFORE UPDATE ON public.mechanization_centers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Service Orders
CREATE TABLE public.service_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  center_id UUID REFERENCES public.mechanization_centers(id),
  farmer_id UUID REFERENCES public.farmers(id),
  service_type TEXT NOT NULL DEFAULT 'ploughing',
  area_ha NUMERIC,
  machine_name TEXT,
  operator_name TEXT,
  status TEXT NOT NULL DEFAULT 'requested',
  requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scheduled_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  validated_at TIMESTAMPTZ,
  cost_aoa NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'agropay',
  payment_status TEXT DEFAULT 'pending',
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  notes TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians and admins can view orders"
  ON public.service_orders FOR SELECT TO authenticated
  USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Technicians and admins can create orders"
  ON public.service_orders FOR INSERT TO authenticated
  WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Technicians and admins can update orders"
  ON public.service_orders FOR UPDATE TO authenticated
  USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Admins can delete orders"
  ON public.service_orders FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_service_orders_updated_at
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
  RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5) AS INTEGER)), 0) + 1
    INTO v_seq
    FROM public.service_orders
    WHERE order_number LIKE 'OSM-' || v_year || '-%';
  NEW.order_number := 'OSM-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_service_order_number
  BEFORE INSERT ON public.service_orders
  FOR EACH ROW WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION public.generate_order_number();

-- Mechanization Validations
CREATE TABLE public.mechanization_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_order_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  worked_polygon JSONB,
  calculated_area_ha NUMERIC,
  declared_area_ha NUMERIC,
  area_deviation_pct NUMERIC,
  validation_method TEXT DEFAULT 'satellite',
  validation_status TEXT DEFAULT 'pending',
  validated_by UUID,
  validation_notes TEXT,
  satellite_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mechanization_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technicians and admins can view validations"
  ON public.mechanization_validations FOR SELECT TO authenticated
  USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Technicians and admins can create validations"
  ON public.mechanization_validations FOR INSERT TO authenticated
  WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Technicians and admins can update validations"
  ON public.mechanization_validations FOR UPDATE TO authenticated
  USING (public.is_technician_or_admin(auth.uid()));

CREATE TRIGGER update_mechanization_validations_updated_at
  BEFORE UPDATE ON public.mechanization_validations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
