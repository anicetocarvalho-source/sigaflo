-- =============================================
-- MÓDULO DE GESTÃO FLORESTAL - SCHEMA COMPLETO
-- =============================================

-- Enum para tipos de licença florestal
CREATE TYPE forest_license_type AS ENUM (
  'exploitation',  -- Exploração
  'transport',     -- Transporte
  'export',        -- Exportação
  'sawmill',       -- Serraria
  'processing'     -- Transformação
);

-- Enum para status da licença
CREATE TYPE forest_license_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'active',
  'suspended',
  'expired',
  'revoked',
  'rejected'
);

-- Enum para tipos de espécies de madeira
CREATE TYPE wood_classification AS ENUM (
  'precious',    -- Preciosa (Classe A)
  'first_class', -- Primeira Classe (B)
  'second_class', -- Segunda Classe (C)
  'common'       -- Comum (D)
);

-- Enum para status de rastreabilidade
CREATE TYPE tracking_status AS ENUM (
  'at_origin',
  'felled',
  'logged',
  'in_transport',
  'at_checkpoint',
  'at_sawmill',
  'processed',
  'in_storage',
  'exported',
  'at_destination'
);

-- Enum para tipos de infracção
CREATE TYPE infraction_type AS ENUM (
  'illegal_cutting',
  'transport_without_license',
  'exceeded_quota',
  'protected_species',
  'false_declaration',
  'document_forgery',
  'unauthorized_area',
  'environmental_damage',
  'other'
);

-- Enum para status de infracção
CREATE TYPE infraction_status AS ENUM (
  'reported',
  'investigating',
  'confirmed',
  'contested',
  'sanctioned',
  'appealed',
  'closed',
  'archived'
);

-- =============================================
-- TABELA: OPERADORES FLORESTAIS
-- =============================================
CREATE TABLE public.forest_operators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  trade_name TEXT,
  nif TEXT NOT NULL UNIQUE,
  operator_type TEXT NOT NULL DEFAULT 'company', -- company, individual, cooperative
  address TEXT,
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  phone TEXT,
  email TEXT,
  legal_representative TEXT,
  registration_number TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- =============================================
-- TABELA: LICENÇAS FLORESTAIS
-- =============================================
CREATE TABLE public.forest_licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_number TEXT NOT NULL UNIQUE,
  license_type forest_license_type NOT NULL,
  status forest_license_status NOT NULL DEFAULT 'draft',
  operator_id UUID NOT NULL REFERENCES public.forest_operators(id),
  
  -- Área de concessão (para exploração)
  concession_area_name TEXT,
  concession_area_ha NUMERIC,
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  commune_id UUID REFERENCES public.communes(id),
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Espécies e volumes autorizados
  authorized_species TEXT[],
  authorized_volume_m3 NUMERIC,
  harvested_volume_m3 NUMERIC DEFAULT 0,
  
  -- Datas
  application_date DATE,
  issue_date DATE,
  start_date DATE,
  expiry_date DATE,
  
  -- Taxas e pagamentos
  license_fee_aoa NUMERIC,
  fee_paid BOOLEAN DEFAULT false,
  payment_date DATE,
  payment_reference TEXT,
  
  -- Workflow
  submitted_at TIMESTAMP WITH TIME ZONE,
  submitted_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  review_notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approval_notes TEXT,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID,
  rejection_reason TEXT,
  
  -- QR e verificação
  qr_code_data TEXT,
  verification_url TEXT,
  
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- =============================================
-- TABELA: ÁRVORES MARCADAS (origem da madeira)
-- =============================================
CREATE TABLE public.forest_trees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tree_code TEXT NOT NULL UNIQUE, -- Código único da árvore
  license_id UUID NOT NULL REFERENCES public.forest_licenses(id),
  
  species TEXT NOT NULL,
  wood_class wood_classification NOT NULL,
  estimated_volume_m3 NUMERIC,
  actual_volume_m3 NUMERIC,
  
  -- Localização
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  plot_number TEXT,
  
  -- Status
  status tracking_status NOT NULL DEFAULT 'at_origin',
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  marked_by UUID,
  felled_at TIMESTAMP WITH TIME ZONE,
  felled_by UUID,
  
  diameter_cm NUMERIC,
  height_m NUMERIC,
  health_status TEXT, -- healthy, damaged, diseased
  
  photos JSONB DEFAULT '[]',
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABELA: TORAS (madeira serrada)
-- =============================================
CREATE TABLE public.forest_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  log_code TEXT NOT NULL UNIQUE, -- Código único da tora
  tree_id UUID REFERENCES public.forest_trees(id),
  license_id UUID NOT NULL REFERENCES public.forest_licenses(id),
  
  species TEXT NOT NULL,
  wood_class wood_classification NOT NULL,
  volume_m3 NUMERIC NOT NULL,
  length_m NUMERIC,
  diameter_cm NUMERIC,
  
  -- Status e localização atual
  status tracking_status NOT NULL DEFAULT 'logged',
  current_latitude NUMERIC,
  current_longitude NUMERIC,
  current_location_name TEXT,
  
  -- Serraria destino
  destination_sawmill_id UUID,
  destination_name TEXT,
  
  -- QR para rastreio
  qr_code_data TEXT,
  
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  logged_by UUID,
  
  photos JSONB DEFAULT '[]',
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABELA: GUIAS DE TRANSPORTE
-- =============================================
CREATE TABLE public.forest_transport_permits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  permit_number TEXT NOT NULL UNIQUE,
  license_id UUID NOT NULL REFERENCES public.forest_licenses(id),
  operator_id UUID NOT NULL REFERENCES public.forest_operators(id),
  
  -- Detalhes do transporte
  vehicle_plate TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_document TEXT,
  driver_phone TEXT,
  
  -- Origem
  origin_location TEXT NOT NULL,
  origin_latitude NUMERIC,
  origin_longitude NUMERIC,
  origin_province_id UUID REFERENCES public.provinces(id),
  
  -- Destino
  destination_location TEXT NOT NULL,
  destination_latitude NUMERIC,
  destination_longitude NUMERIC,
  destination_province_id UUID REFERENCES public.provinces(id),
  
  -- Carga
  log_ids UUID[], -- Array de IDs das toras
  total_logs INTEGER,
  total_volume_m3 NUMERIC,
  species_summary JSONB, -- {species: volume}
  
  -- Validade
  issue_date DATE NOT NULL,
  valid_until DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, expired, cancelled
  
  -- Checkpoints
  checkpoints_passed JSONB DEFAULT '[]',
  
  departure_at TIMESTAMP WITH TIME ZONE,
  arrival_at TIMESTAMP WITH TIME ZONE,
  
  qr_code_data TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- =============================================
-- TABELA: CHECKPOINTS DE FISCALIZAÇÃO
-- =============================================
CREATE TABLE public.forest_checkpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  checkpoint_type TEXT NOT NULL DEFAULT 'road', -- road, port, border, sawmill
  
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  address TEXT,
  
  is_active BOOLEAN DEFAULT true,
  operating_hours TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABELA: REGISTOS DE PASSAGEM EM CHECKPOINTS
-- =============================================
CREATE TABLE public.forest_checkpoint_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkpoint_id UUID NOT NULL REFERENCES public.forest_checkpoints(id),
  transport_permit_id UUID NOT NULL REFERENCES public.forest_transport_permits(id),
  
  arrival_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  departure_at TIMESTAMP WITH TIME ZONE,
  
  inspector_id UUID,
  inspector_name TEXT,
  
  -- Verificação
  documents_verified BOOLEAN DEFAULT false,
  cargo_verified BOOLEAN DEFAULT false,
  volume_matches BOOLEAN,
  species_matches BOOLEAN,
  
  -- Discrepâncias
  discrepancies_found BOOLEAN DEFAULT false,
  discrepancy_notes TEXT,
  
  -- Decisão
  decision TEXT DEFAULT 'passed', -- passed, detained, referred
  detention_reason TEXT,
  
  photos JSONB DEFAULT '[]',
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABELA: AUTOS DE INFRACÇÃO
-- =============================================
CREATE TABLE public.forest_infractions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  infraction_number TEXT NOT NULL UNIQUE,
  infraction_type infraction_type NOT NULL,
  status infraction_status NOT NULL DEFAULT 'reported',
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  
  -- Infractor
  operator_id UUID REFERENCES public.forest_operators(id),
  infractor_name TEXT,
  infractor_document TEXT,
  infractor_address TEXT,
  
  -- Local da infracção
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  latitude NUMERIC,
  longitude NUMERIC,
  location_description TEXT,
  
  -- Detalhes
  description TEXT NOT NULL,
  evidence_description TEXT,
  photos JSONB DEFAULT '[]',
  
  -- Materiais apreendidos
  seized_materials JSONB, -- {type, quantity, estimated_value}
  seized_volume_m3 NUMERIC,
  seized_species TEXT[],
  
  -- Licenças relacionadas
  related_license_id UUID REFERENCES public.forest_licenses(id),
  related_transport_id UUID REFERENCES public.forest_transport_permits(id),
  
  -- Datas
  occurrence_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reported_by UUID,
  
  -- Investigação
  assigned_to UUID,
  investigation_notes TEXT,
  investigated_at TIMESTAMP WITH TIME ZONE,
  
  -- Sanção
  sanction_type TEXT, -- fine, suspension, revocation, seizure, criminal
  fine_amount_aoa NUMERIC,
  fine_paid BOOLEAN DEFAULT false,
  fine_paid_at TIMESTAMP WITH TIME ZONE,
  suspension_days INTEGER,
  
  -- Contestação
  contested BOOLEAN DEFAULT false,
  contest_reason TEXT,
  contest_date TIMESTAMP WITH TIME ZONE,
  contest_decision TEXT,
  contest_decision_date TIMESTAMP WITH TIME ZONE,
  
  closed_at TIMESTAMP WITH TIME ZONE,
  closed_by UUID,
  closure_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABELA: DENÚNCIAS COMUNITÁRIAS
-- =============================================
CREATE TABLE public.forest_complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, investigating, confirmed, dismissed, resolved
  
  -- Denunciante (opcional - pode ser anónimo)
  is_anonymous BOOLEAN DEFAULT false,
  complainant_name TEXT,
  complainant_phone TEXT,
  complainant_email TEXT,
  
  -- Local
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  commune_id UUID REFERENCES public.communes(id),
  latitude NUMERIC,
  longitude NUMERIC,
  location_description TEXT NOT NULL,
  
  -- Detalhes da denúncia
  complaint_type TEXT NOT NULL, -- illegal_cutting, illegal_transport, fire, pollution, other
  description TEXT NOT NULL,
  occurrence_date TIMESTAMP WITH TIME ZONE,
  photos JSONB DEFAULT '[]',
  
  -- Processamento
  received_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_to UUID,
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Investigação
  investigation_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  verification_result TEXT, -- confirmed, partial, not_confirmed
  
  -- Acções tomadas
  actions_taken TEXT,
  infraction_id UUID REFERENCES public.forest_infractions(id),
  
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolution_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABELA: VIVEIROS FLORESTAIS
-- =============================================
CREATE TABLE public.forest_nurseries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  nursery_type TEXT NOT NULL DEFAULT 'public', -- public, private, community
  
  operator_id UUID REFERENCES public.forest_operators(id),
  
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  latitude NUMERIC,
  longitude NUMERIC,
  address TEXT,
  
  area_ha NUMERIC,
  capacity_seedlings INTEGER,
  current_stock INTEGER DEFAULT 0,
  
  species_produced TEXT[],
  
  manager_name TEXT,
  phone TEXT,
  email TEXT,
  
  is_active BOOLEAN DEFAULT true,
  established_date DATE,
  
  photos JSONB DEFAULT '[]',
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABELA: STOCK DE MUDAS
-- =============================================
CREATE TABLE public.forest_seedling_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nursery_id UUID NOT NULL REFERENCES public.forest_nurseries(id),
  
  species TEXT NOT NULL,
  variety TEXT,
  wood_class wood_classification,
  
  quantity INTEGER NOT NULL,
  age_months INTEGER,
  height_cm_avg NUMERIC,
  
  ready_for_planting BOOLEAN DEFAULT false,
  
  production_date DATE,
  expected_ready_date DATE,
  
  cost_per_unit_aoa NUMERIC,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TABELA: PROGRAMAS DE REFLORESTAMENTO
-- =============================================
CREATE TABLE public.forest_reforestation_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  program_type TEXT NOT NULL DEFAULT 'restoration', -- restoration, commercial, community, compensation
  
  -- Área
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  target_area_ha NUMERIC NOT NULL,
  planted_area_ha NUMERIC DEFAULT 0,
  
  latitude NUMERIC,
  longitude NUMERIC,
  area_polygon JSONB, -- GeoJSON polygon
  
  -- Metas
  target_seedlings INTEGER NOT NULL,
  planted_seedlings INTEGER DEFAULT 0,
  survival_rate NUMERIC,
  
  target_species TEXT[],
  
  -- Datas
  start_date DATE NOT NULL,
  target_end_date DATE,
  actual_end_date DATE,
  
  -- Orçamento
  budget_aoa NUMERIC,
  spent_aoa NUMERIC DEFAULT 0,
  
  -- Responsáveis
  implementing_entity TEXT,
  coordinator_name TEXT,
  coordinator_phone TEXT,
  
  status TEXT NOT NULL DEFAULT 'planning', -- planning, active, completed, suspended, cancelled
  
  description TEXT,
  objectives TEXT,
  
  photos JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- =============================================
-- TABELA: ACTIVIDADES DE REFLORESTAMENTO
-- =============================================
CREATE TABLE public.forest_reforestation_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.forest_reforestation_programs(id),
  
  activity_type TEXT NOT NULL, -- site_preparation, planting, watering, weeding, monitoring, replanting
  activity_date DATE NOT NULL,
  
  -- Detalhes
  area_covered_ha NUMERIC,
  seedlings_planted INTEGER,
  seedlings_replaced INTEGER,
  
  species_planted JSONB, -- [{species, quantity}]
  nursery_id UUID REFERENCES public.forest_nurseries(id),
  
  -- Equipa
  team_size INTEGER,
  team_leader TEXT,
  
  -- Monitorização
  survival_count INTEGER,
  mortality_count INTEGER,
  observations TEXT,
  
  photos JSONB DEFAULT '[]',
  
  cost_aoa NUMERIC,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX idx_forest_licenses_operator ON public.forest_licenses(operator_id);
CREATE INDEX idx_forest_licenses_status ON public.forest_licenses(status);
CREATE INDEX idx_forest_licenses_type ON public.forest_licenses(license_type);
CREATE INDEX idx_forest_licenses_province ON public.forest_licenses(province_id);
CREATE INDEX idx_forest_trees_license ON public.forest_trees(license_id);
CREATE INDEX idx_forest_trees_status ON public.forest_trees(status);
CREATE INDEX idx_forest_logs_tree ON public.forest_logs(tree_id);
CREATE INDEX idx_forest_logs_license ON public.forest_logs(license_id);
CREATE INDEX idx_forest_logs_status ON public.forest_logs(status);
CREATE INDEX idx_forest_transport_license ON public.forest_transport_permits(license_id);
CREATE INDEX idx_forest_transport_status ON public.forest_transport_permits(status);
CREATE INDEX idx_forest_checkpoint_logs_checkpoint ON public.forest_checkpoint_logs(checkpoint_id);
CREATE INDEX idx_forest_checkpoint_logs_permit ON public.forest_checkpoint_logs(transport_permit_id);
CREATE INDEX idx_forest_infractions_status ON public.forest_infractions(status);
CREATE INDEX idx_forest_infractions_type ON public.forest_infractions(infraction_type);
CREATE INDEX idx_forest_infractions_province ON public.forest_infractions(province_id);
CREATE INDEX idx_forest_complaints_status ON public.forest_complaints(status);
CREATE INDEX idx_forest_complaints_province ON public.forest_complaints(province_id);
CREATE INDEX idx_forest_nurseries_province ON public.forest_nurseries(province_id);
CREATE INDEX idx_forest_seedling_nursery ON public.forest_seedling_stock(nursery_id);
CREATE INDEX idx_forest_reforestation_province ON public.forest_reforestation_programs(province_id);
CREATE INDEX idx_forest_reforestation_status ON public.forest_reforestation_programs(status);
CREATE INDEX idx_forest_activities_program ON public.forest_reforestation_activities(program_id);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.forest_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_transport_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_checkpoint_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_infractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_nurseries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_seedling_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_reforestation_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forest_reforestation_activities ENABLE ROW LEVEL SECURITY;

-- Forest Operators policies
CREATE POLICY "Forest operators viewable by authenticated" ON public.forest_operators 
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Forest operators insertable by authenticated" ON public.forest_operators 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Forest operators updatable by authenticated" ON public.forest_operators 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Forest Licenses policies
CREATE POLICY "Forest licenses viewable by authenticated" ON public.forest_licenses 
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Forest licenses insertable by authenticated" ON public.forest_licenses 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Forest licenses updatable by authenticated" ON public.forest_licenses 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Trees policies
CREATE POLICY "Forest trees viewable by authenticated" ON public.forest_trees 
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Forest trees insertable by authenticated" ON public.forest_trees 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Forest trees updatable by authenticated" ON public.forest_trees 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Logs policies
CREATE POLICY "Forest logs viewable by authenticated" ON public.forest_logs 
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Forest logs insertable by authenticated" ON public.forest_logs 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Forest logs updatable by authenticated" ON public.forest_logs 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Transport permits policies
CREATE POLICY "Transport permits viewable by authenticated" ON public.forest_transport_permits 
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Transport permits insertable by authenticated" ON public.forest_transport_permits 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Transport permits updatable by authenticated" ON public.forest_transport_permits 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Checkpoints policies (viewable by everyone for public verification)
CREATE POLICY "Checkpoints viewable by everyone" ON public.forest_checkpoints 
  FOR SELECT USING (true);
CREATE POLICY "Checkpoints insertable by authenticated" ON public.forest_checkpoints 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Checkpoints updatable by authenticated" ON public.forest_checkpoints 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Checkpoint logs policies
CREATE POLICY "Checkpoint logs viewable by authenticated" ON public.forest_checkpoint_logs 
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Checkpoint logs insertable by authenticated" ON public.forest_checkpoint_logs 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Infractions policies
CREATE POLICY "Infractions viewable by authenticated" ON public.forest_infractions 
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Infractions insertable by authenticated" ON public.forest_infractions 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Infractions updatable by authenticated" ON public.forest_infractions 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Complaints policies (public can submit)
CREATE POLICY "Complaints viewable by authenticated" ON public.forest_complaints 
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Complaints insertable by anyone" ON public.forest_complaints 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Complaints updatable by authenticated" ON public.forest_complaints 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Nurseries policies
CREATE POLICY "Nurseries viewable by everyone" ON public.forest_nurseries 
  FOR SELECT USING (true);
CREATE POLICY "Nurseries insertable by authenticated" ON public.forest_nurseries 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Nurseries updatable by authenticated" ON public.forest_nurseries 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Seedling stock policies
CREATE POLICY "Seedling stock viewable by everyone" ON public.forest_seedling_stock 
  FOR SELECT USING (true);
CREATE POLICY "Seedling stock insertable by authenticated" ON public.forest_seedling_stock 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Seedling stock updatable by authenticated" ON public.forest_seedling_stock 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Reforestation programs policies
CREATE POLICY "Reforestation programs viewable by everyone" ON public.forest_reforestation_programs 
  FOR SELECT USING (true);
CREATE POLICY "Reforestation programs insertable by authenticated" ON public.forest_reforestation_programs 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Reforestation programs updatable by authenticated" ON public.forest_reforestation_programs 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Reforestation activities policies
CREATE POLICY "Reforestation activities viewable by everyone" ON public.forest_reforestation_activities 
  FOR SELECT USING (true);
CREATE POLICY "Reforestation activities insertable by authenticated" ON public.forest_reforestation_activities 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================
CREATE TRIGGER update_forest_operators_updated_at BEFORE UPDATE ON public.forest_operators
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forest_licenses_updated_at BEFORE UPDATE ON public.forest_licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forest_trees_updated_at BEFORE UPDATE ON public.forest_trees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forest_logs_updated_at BEFORE UPDATE ON public.forest_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forest_transport_updated_at BEFORE UPDATE ON public.forest_transport_permits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forest_checkpoints_updated_at BEFORE UPDATE ON public.forest_checkpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forest_infractions_updated_at BEFORE UPDATE ON public.forest_infractions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forest_complaints_updated_at BEFORE UPDATE ON public.forest_complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forest_nurseries_updated_at BEFORE UPDATE ON public.forest_nurseries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forest_seedling_updated_at BEFORE UPDATE ON public.forest_seedling_stock
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_forest_reforestation_updated_at BEFORE UPDATE ON public.forest_reforestation_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FUNÇÕES AUXILIARES
-- =============================================

-- Gerar número de licença
CREATE OR REPLACE FUNCTION public.generate_forest_license_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  year_part TEXT;
  seq_num INTEGER;
BEGIN
  prefix := CASE NEW.license_type
    WHEN 'exploitation' THEN 'LEX'
    WHEN 'transport' THEN 'LTR'
    WHEN 'export' THEN 'LEP'
    WHEN 'sawmill' THEN 'LSE'
    WHEN 'processing' THEN 'LPR'
  END;
  
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(license_number FROM 9) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.forest_licenses
  WHERE license_number LIKE prefix || '-' || year_part || '-%';
  
  NEW.license_number := prefix || '-' || year_part || '-' || LPAD(seq_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_forest_license_number_trigger
  BEFORE INSERT ON public.forest_licenses
  FOR EACH ROW
  WHEN (NEW.license_number IS NULL OR NEW.license_number = '')
  EXECUTE FUNCTION public.generate_forest_license_number();

-- Gerar número de infracção
CREATE OR REPLACE FUNCTION public.generate_infraction_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(infraction_number FROM 6) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.forest_infractions
  WHERE infraction_number LIKE 'INF-' || year_part || '-%';
  
  NEW.infraction_number := 'INF-' || year_part || '-' || LPAD(seq_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_infraction_number_trigger
  BEFORE INSERT ON public.forest_infractions
  FOR EACH ROW
  WHEN (NEW.infraction_number IS NULL OR NEW.infraction_number = '')
  EXECUTE FUNCTION public.generate_infraction_number();

-- Gerar número de denúncia
CREATE OR REPLACE FUNCTION public.generate_complaint_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(complaint_number FROM 6) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.forest_complaints
  WHERE complaint_number LIKE 'DEN-' || year_part || '-%';
  
  NEW.complaint_number := 'DEN-' || year_part || '-' || LPAD(seq_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_complaint_number_trigger
  BEFORE INSERT ON public.forest_complaints
  FOR EACH ROW
  WHEN (NEW.complaint_number IS NULL OR NEW.complaint_number = '')
  EXECUTE FUNCTION public.generate_complaint_number();