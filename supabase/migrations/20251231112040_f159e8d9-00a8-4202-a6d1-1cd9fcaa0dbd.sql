-- Dataset definitions for controlled access
CREATE TABLE public.data_lab_datasets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  source_table TEXT NOT NULL,
  data_category TEXT NOT NULL DEFAULT 'production', -- production, climate, forestry, farmers, certificates, incentives
  sensitivity_level TEXT NOT NULL DEFAULT 'internal', -- public, internal, restricted, confidential
  available_fields TEXT[] DEFAULT '{}',
  restricted_fields TEXT[] DEFAULT '{}',
  row_filter TEXT, -- SQL condition for row-level filtering
  aggregation_required BOOLEAN DEFAULT false,
  min_aggregation_level TEXT, -- province, municipality, commune
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Research organization/institution profiles
CREATE TABLE public.data_lab_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  organization_type TEXT NOT NULL DEFAULT 'university', -- ine, university, international, research_center, ngo
  country TEXT DEFAULT 'Angola',
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  agreement_reference TEXT, -- MOU or agreement number
  agreement_start_date DATE,
  agreement_end_date DATE,
  max_concurrent_users INTEGER DEFAULT 3,
  allowed_datasets TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Researcher/analyst profiles
CREATE TABLE public.data_lab_researchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES public.data_lab_organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  position TEXT,
  research_area TEXT,
  access_level TEXT NOT NULL DEFAULT 'basic', -- basic, advanced, full
  allowed_datasets TEXT[] DEFAULT '{}',
  max_exports_per_month INTEGER DEFAULT 10,
  exports_this_month INTEGER DEFAULT 0,
  last_export_reset DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  expires_at DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Data access requests
CREATE TABLE public.data_lab_access_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT NOT NULL UNIQUE,
  researcher_id UUID REFERENCES public.data_lab_researchers(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.data_lab_organizations(id),
  dataset_ids TEXT[] NOT NULL,
  purpose TEXT NOT NULL,
  research_description TEXT,
  expected_duration_days INTEGER DEFAULT 30,
  requested_fields TEXT[],
  geographic_scope TEXT[], -- province IDs or 'national'
  temporal_scope_start DATE,
  temporal_scope_end DATE,
  output_format TEXT DEFAULT 'aggregated', -- aggregated, anonymized, full
  status TEXT NOT NULL DEFAULT 'pending', -- pending, under_review, approved, rejected, expired
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  approved_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Saved queries for reuse
CREATE TABLE public.data_lab_saved_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  researcher_id UUID REFERENCES public.data_lab_researchers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  dataset_id UUID REFERENCES public.data_lab_datasets(id),
  query_config JSONB NOT NULL, -- filters, groupings, aggregations
  is_template BOOLEAN DEFAULT false, -- system templates for common analyses
  is_public BOOLEAN DEFAULT false, -- shared with other researchers
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Query execution history
CREATE TABLE public.data_lab_query_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  researcher_id UUID REFERENCES public.data_lab_researchers(id) ON DELETE SET NULL,
  saved_query_id UUID REFERENCES public.data_lab_saved_queries(id) ON DELETE SET NULL,
  dataset_id UUID REFERENCES public.data_lab_datasets(id),
  query_config JSONB NOT NULL,
  execution_time_ms INTEGER,
  rows_returned INTEGER,
  was_exported BOOLEAN DEFAULT false,
  export_format TEXT,
  ip_address TEXT,
  user_agent TEXT,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Data exports audit
CREATE TABLE public.data_lab_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  researcher_id UUID REFERENCES public.data_lab_researchers(id) ON DELETE SET NULL,
  query_history_id UUID REFERENCES public.data_lab_query_history(id),
  dataset_ids TEXT[],
  export_format TEXT NOT NULL, -- csv, xlsx, json
  row_count INTEGER,
  file_size_bytes INTEGER,
  filters_applied JSONB,
  geographic_scope TEXT[],
  temporal_scope_start DATE,
  temporal_scope_end DATE,
  purpose TEXT,
  ip_address TEXT,
  download_token TEXT UNIQUE,
  downloaded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comprehensive audit log for all data lab activities
CREATE TABLE public.data_lab_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  researcher_id UUID REFERENCES public.data_lab_researchers(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.data_lab_organizations(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- login, logout, query, export, access_request, view_dataset
  resource_type TEXT, -- dataset, query, export, request
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.data_lab_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_lab_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_lab_researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_lab_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_lab_saved_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_lab_query_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_lab_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_lab_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies for datasets (viewable by authenticated users)
CREATE POLICY "Datasets viewable by authenticated users" ON public.data_lab_datasets
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage datasets" ON public.data_lab_datasets
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Policies for organizations
CREATE POLICY "Organizations viewable by authenticated users" ON public.data_lab_organizations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage organizations" ON public.data_lab_organizations
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Policies for researchers
CREATE POLICY "Researchers can view own profile" ON public.data_lab_researchers
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage researchers" ON public.data_lab_researchers
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Policies for access requests
CREATE POLICY "Researchers can view own requests" ON public.data_lab_access_requests
  FOR SELECT TO authenticated 
  USING (researcher_id IN (SELECT id FROM public.data_lab_researchers WHERE user_id = auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Researchers can create requests" ON public.data_lab_access_requests
  FOR INSERT TO authenticated 
  WITH CHECK (researcher_id IN (SELECT id FROM public.data_lab_researchers WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage requests" ON public.data_lab_access_requests
  FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- Policies for saved queries
CREATE POLICY "Researchers can manage own queries" ON public.data_lab_saved_queries
  FOR ALL TO authenticated 
  USING (researcher_id IN (SELECT id FROM public.data_lab_researchers WHERE user_id = auth.uid()) 
         OR is_public = true 
         OR public.is_admin(auth.uid()));

-- Policies for query history
CREATE POLICY "Researchers can view own history" ON public.data_lab_query_history
  FOR SELECT TO authenticated 
  USING (researcher_id IN (SELECT id FROM public.data_lab_researchers WHERE user_id = auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "System can insert history" ON public.data_lab_query_history
  FOR INSERT TO authenticated WITH CHECK (true);

-- Policies for exports
CREATE POLICY "Researchers can view own exports" ON public.data_lab_exports
  FOR SELECT TO authenticated 
  USING (researcher_id IN (SELECT id FROM public.data_lab_researchers WHERE user_id = auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "System can create exports" ON public.data_lab_exports
  FOR INSERT TO authenticated WITH CHECK (true);

-- Policies for audit log (only admins can view)
CREATE POLICY "Admins can view audit log" ON public.data_lab_audit_log
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert audit entries" ON public.data_lab_audit_log
  FOR INSERT TO authenticated WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_data_lab_researchers_org ON public.data_lab_researchers(organization_id);
CREATE INDEX idx_data_lab_researchers_user ON public.data_lab_researchers(user_id);
CREATE INDEX idx_data_lab_access_requests_researcher ON public.data_lab_access_requests(researcher_id);
CREATE INDEX idx_data_lab_access_requests_status ON public.data_lab_access_requests(status);
CREATE INDEX idx_data_lab_query_history_researcher ON public.data_lab_query_history(researcher_id);
CREATE INDEX idx_data_lab_query_history_executed ON public.data_lab_query_history(executed_at);
CREATE INDEX idx_data_lab_exports_researcher ON public.data_lab_exports(researcher_id);
CREATE INDEX idx_data_lab_audit_log_researcher ON public.data_lab_audit_log(researcher_id);
CREATE INDEX idx_data_lab_audit_log_created ON public.data_lab_audit_log(created_at);
CREATE INDEX idx_data_lab_audit_log_action ON public.data_lab_audit_log(action);

-- Trigger for updated_at
CREATE TRIGGER update_data_lab_datasets_updated_at BEFORE UPDATE ON public.data_lab_datasets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_lab_organizations_updated_at BEFORE UPDATE ON public.data_lab_organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_lab_researchers_updated_at BEFORE UPDATE ON public.data_lab_researchers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_lab_access_requests_updated_at BEFORE UPDATE ON public.data_lab_access_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_lab_saved_queries_updated_at BEFORE UPDATE ON public.data_lab_saved_queries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate access request number
CREATE OR REPLACE FUNCTION public.generate_access_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 5) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.data_lab_access_requests
  WHERE request_number LIKE 'DAR-' || year_part || '-%';
  
  NEW.request_number := 'DAR-' || year_part || '-' || LPAD(seq_num::TEXT, 6, '0');
  RETURN NEW;
END;
$function$;

CREATE TRIGGER generate_access_request_number_trigger
  BEFORE INSERT ON public.data_lab_access_requests
  FOR EACH ROW
  WHEN (NEW.request_number IS NULL OR NEW.request_number = '')
  EXECUTE FUNCTION public.generate_access_request_number();

-- Insert default datasets
INSERT INTO public.data_lab_datasets (code, name, description, source_table, data_category, sensitivity_level, available_fields, min_aggregation_level)
VALUES 
  ('FARMERS', 'Registo de Agricultores', 'Dados do cadastro nacional de agricultores', 'farmers', 'farmers', 'internal', 
   ARRAY['province_id', 'municipality_id', 'farmer_type', 'total_area_ha', 'main_crops', 'registration_date'], 'municipality'),
  ('PRODUCTION', 'Histórico de Produção', 'Séries temporais de produção agrícola', 'production_history', 'production', 'internal',
   ARRAY['crop_type', 'season', 'year', 'area_planted_ha', 'actual_yield_kg'], 'province'),
  ('CLIMATE', 'Ocorrências Climáticas', 'Eventos climáticos e impactos', 'climate_occurrences', 'climate', 'public',
   ARRAY['occurrence_type', 'severity', 'report_date', 'affected_area_ha', 'estimated_loss_aoa', 'province_id'], NULL),
  ('CERTIFICATES', 'Certificados Agrícolas', 'Certificações emitidas', 'agricultural_certificates', 'certificates', 'internal',
   ARRAY['certificate_type', 'status', 'year', 'season', 'crops', 'total_quantity_kg'], 'province'),
  ('FORESTRY', 'Licenças Florestais', 'Licenciamento e exploração florestal', 'forest_licenses', 'forestry', 'restricted',
   ARRAY['license_type', 'status', 'authorized_volume_m3', 'harvested_volume_m3', 'province_id'], 'province'),
  ('INCENTIVES', 'Programas de Incentivos', 'Subsídios e alocações', 'incentive_programs', 'incentives', 'confidential',
   ARRAY['program_type', 'sector', 'status', 'budget_aoa', 'target_provinces'], NULL);