-- ============================================================
-- COOPERATIVE DETAILS (1:1 com farmers)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cooperative_details (
  farmer_id UUID PRIMARY KEY REFERENCES public.farmers(id) ON DELETE CASCADE,
  -- Jurídico
  nif TEXT,
  legal_constitution_date DATE,
  dncm_registration_number TEXT,
  license_url TEXT,
  statutes_url TEXT,
  -- Órgãos sociais
  president_name TEXT,
  president_phone TEXT,
  secretary_name TEXT,
  treasurer_name TEXT,
  board_contacts JSONB DEFAULT '[]'::jsonb,
  -- Estrutura
  degree TEXT CHECK (degree IN ('first_degree','second_degree')),
  total_members INTEGER DEFAULT 0,
  share_capital_aoa NUMERIC(14,2),
  minimum_quota_aoa NUMERIC(14,2),
  -- Atividade
  aggregated_area_ha NUMERIC(12,2),
  infrastructures TEXT[] DEFAULT '{}'::text[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

ALTER TABLE public.cooperative_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read cooperative details"
  ON public.cooperative_details FOR SELECT TO authenticated
  USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can insert cooperative details"
  ON public.cooperative_details FOR INSERT TO authenticated
  WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update cooperative details"
  ON public.cooperative_details FOR UPDATE TO authenticated
  USING (public.is_technician_or_admin(auth.uid()))
  WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Admins can delete cooperative details"
  ON public.cooperative_details FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER cooperative_details_updated_at
  BEFORE UPDATE ON public.cooperative_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- FIELD SCHOOL DETAILS (1:1 com farmers)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.field_school_details (
  farmer_id UUID PRIMARY KEY REFERENCES public.farmers(id) ON DELETE CASCADE,
  -- Pedagógico
  facilitator_id UUID REFERENCES public.field_technicians(id),
  start_date DATE,
  duration_months INTEGER,
  curriculum_modules TEXT[] DEFAULT '{}'::text[],
  focus_crop TEXT,
  -- Composição da turma
  participants_count INTEGER DEFAULT 0,
  participants_male INTEGER DEFAULT 0,
  participants_female INTEGER DEFAULT 0,
  avg_age_range TEXT,
  avg_education_level TEXT,
  -- Promotor
  promoter_entity TEXT,
  promoter_name TEXT,
  funding_source TEXT,
  linked_project TEXT,
  -- Parcela demonstrativa
  demo_parcel_area_ha NUMERIC(10,2),
  demo_crops TEXT[] DEFAULT '{}'::text[],
  session_schedule JSONB DEFAULT '[]'::jsonb,
  demo_latitude NUMERIC(10,8),
  demo_longitude NUMERIC(11,8),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

ALTER TABLE public.field_school_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read field school details"
  ON public.field_school_details FOR SELECT TO authenticated
  USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can insert field school details"
  ON public.field_school_details FOR INSERT TO authenticated
  WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update field school details"
  ON public.field_school_details FOR UPDATE TO authenticated
  USING (public.is_technician_or_admin(auth.uid()))
  WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Admins can delete field school details"
  ON public.field_school_details FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER field_school_details_updated_at
  BEFORE UPDATE ON public.field_school_details
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_field_school_details_facilitator
  ON public.field_school_details(facilitator_id);