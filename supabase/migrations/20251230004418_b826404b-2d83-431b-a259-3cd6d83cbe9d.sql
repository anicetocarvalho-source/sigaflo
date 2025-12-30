
-- Enum para tipos de entidade agrícola
CREATE TYPE public.farmer_type AS ENUM ('individual', 'family', 'cooperative', 'field_school', 'company');

-- Enum para workflow status
CREATE TYPE public.workflow_status AS ENUM ('draft', 'submitted', 'validated', 'approved', 'issued', 'rejected', 'expired');

-- Enum para tipo de certificado
CREATE TYPE public.certificate_type AS ENUM ('production', 'organic', 'quality', 'origin', 'good_practices');

-- Tabela de Províncias
CREATE TABLE public.provinces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Municípios
CREATE TABLE public.municipalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    province_id UUID NOT NULL REFERENCES public.provinces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(province_id, name)
);

-- Tabela de Comunas
CREATE TABLE public.communes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID NOT NULL REFERENCES public.municipalities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(municipality_id, name)
);

-- Tabela principal de Agricultores/Entidades
CREATE TABLE public.farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_type public.farmer_type NOT NULL DEFAULT 'individual',
    
    -- Dados Pessoais/Institucionais
    name TEXT NOT NULL,
    trade_name TEXT,
    bi_nif TEXT,
    phone TEXT,
    email TEXT,
    
    -- Localização
    province_id UUID REFERENCES public.provinces(id),
    municipality_id UUID REFERENCES public.municipalities(id),
    commune_id UUID REFERENCES public.communes(id),
    village TEXT,
    address TEXT,
    
    -- Georreferenciação
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Dados Agrícolas
    total_area_ha DECIMAL(10, 2),
    cultivated_area_ha DECIMAL(10, 2),
    main_crops TEXT[],
    secondary_crops TEXT[],
    irrigation_type TEXT,
    
    -- Cooperativa (para membros)
    parent_cooperative_id UUID REFERENCES public.farmers(id),
    
    -- Escola de Campo (para participantes)
    field_school_id UUID REFERENCES public.farmers(id),
    
    -- Metadados
    registration_number TEXT UNIQUE,
    registration_date DATE DEFAULT CURRENT_DATE,
    status public.workflow_status DEFAULT 'draft',
    is_active BOOLEAN DEFAULT true,
    
    -- Auditoria
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID,
    updated_by UUID
);

-- Tabela de Histórico de Produção
CREATE TABLE public.production_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
    
    crop_type TEXT NOT NULL,
    season TEXT NOT NULL,
    year INTEGER NOT NULL,
    area_planted_ha DECIMAL(10, 2),
    expected_yield_kg DECIMAL(12, 2),
    actual_yield_kg DECIMAL(12, 2),
    yield_per_ha DECIMAL(10, 2) GENERATED ALWAYS AS (
        CASE WHEN area_planted_ha > 0 THEN actual_yield_kg / area_planted_ha ELSE 0 END
    ) STORED,
    
    harvest_date DATE,
    quality_grade TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Certificados de Produção Agrícola
CREATE TABLE public.agricultural_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Referências
    farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
    production_history_id UUID REFERENCES public.production_history(id),
    
    -- Dados do Certificado
    certificate_number TEXT UNIQUE NOT NULL,
    certificate_type public.certificate_type NOT NULL DEFAULT 'production',
    
    -- Culturas e Quantidades
    crops TEXT[] NOT NULL,
    total_area_ha DECIMAL(10, 2),
    total_quantity_kg DECIMAL(12, 2),
    
    -- Período
    season TEXT NOT NULL,
    year INTEGER NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    
    -- Workflow
    status public.workflow_status NOT NULL DEFAULT 'draft',
    
    -- Validação Multinível
    submitted_at TIMESTAMPTZ,
    submitted_by UUID,
    
    validated_at TIMESTAMPTZ,
    validated_by UUID,
    validation_notes TEXT,
    
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    approval_notes TEXT,
    
    issued_at TIMESTAMPTZ,
    issued_by UUID,
    
    rejected_at TIMESTAMPTZ,
    rejected_by UUID,
    rejection_reason TEXT,
    
    -- QR Code
    qr_code_data TEXT,
    verification_url TEXT,
    
    -- Auditoria
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Auditoria
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    
    old_values JSONB,
    new_values JSONB,
    
    user_id UUID,
    user_ip TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_farmers_province ON public.farmers(province_id);
CREATE INDEX idx_farmers_municipality ON public.farmers(municipality_id);
CREATE INDEX idx_farmers_type ON public.farmers(farmer_type);
CREATE INDEX idx_farmers_status ON public.farmers(status);
CREATE INDEX idx_farmers_registration ON public.farmers(registration_number);

CREATE INDEX idx_production_farmer ON public.production_history(farmer_id);
CREATE INDEX idx_production_year ON public.production_history(year);

CREATE INDEX idx_certificates_farmer ON public.agricultural_certificates(farmer_id);
CREATE INDEX idx_certificates_number ON public.agricultural_certificates(certificate_number);
CREATE INDEX idx_certificates_status ON public.agricultural_certificates(status);
CREATE INDEX idx_certificates_year ON public.agricultural_certificates(year);

CREATE INDEX idx_audit_entity ON public.audit_log(entity_type, entity_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_farmers_updated_at
    BEFORE UPDATE ON public.farmers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_updated_at
    BEFORE UPDATE ON public.production_history
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON public.agricultural_certificates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar número de registo
CREATE OR REPLACE FUNCTION public.generate_registration_number()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT;
    seq_num INTEGER;
BEGIN
    prefix := CASE NEW.farmer_type
        WHEN 'individual' THEN 'AGR'
        WHEN 'family' THEN 'FAM'
        WHEN 'cooperative' THEN 'COOP'
        WHEN 'field_school' THEN 'ECA'
        WHEN 'company' THEN 'EMP'
    END;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(registration_number FROM 5) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.farmers
    WHERE registration_number LIKE prefix || '-%';
    
    NEW.registration_number := prefix || '-' || LPAD(seq_num::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_farmer_registration
    BEFORE INSERT ON public.farmers
    FOR EACH ROW
    WHEN (NEW.registration_number IS NULL)
    EXECUTE FUNCTION public.generate_registration_number();

-- Função para gerar número de certificado
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT;
    seq_num INTEGER;
BEGIN
    prefix := 'CERT-' || NEW.year || '-';
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_number FROM LENGTH(prefix) + 1) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.agricultural_certificates
    WHERE certificate_number LIKE prefix || '%';
    
    NEW.certificate_number := prefix || LPAD(seq_num::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_certificate_number
    BEFORE INSERT ON public.agricultural_certificates
    FOR EACH ROW
    WHEN (NEW.certificate_number IS NULL OR NEW.certificate_number = '')
    EXECUTE FUNCTION public.generate_certificate_number();

-- Habilitar RLS
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agricultural_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (leitura pública para dados geográficos)
CREATE POLICY "Provinces are viewable by everyone" ON public.provinces FOR SELECT USING (true);
CREATE POLICY "Municipalities are viewable by everyone" ON public.municipalities FOR SELECT USING (true);
CREATE POLICY "Communes are viewable by everyone" ON public.communes FOR SELECT USING (true);

-- Políticas para farmers (leitura pública, escrita autenticada)
CREATE POLICY "Farmers are viewable by everyone" ON public.farmers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert farmers" ON public.farmers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update farmers" ON public.farmers FOR UPDATE TO authenticated USING (true);

-- Políticas para production_history
CREATE POLICY "Production history viewable by everyone" ON public.production_history FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert production" ON public.production_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update production" ON public.production_history FOR UPDATE TO authenticated USING (true);

-- Políticas para certificates
CREATE POLICY "Certificates viewable by everyone" ON public.agricultural_certificates FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert certificates" ON public.agricultural_certificates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update certificates" ON public.agricultural_certificates FOR UPDATE TO authenticated USING (true);

-- Políticas para audit (apenas leitura autenticada)
CREATE POLICY "Audit viewable by authenticated" ON public.audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Audit insert by authenticated" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- Inserir províncias de Angola
INSERT INTO public.provinces (name, code) VALUES
    ('Bengo', 'BGO'),
    ('Benguela', 'BGU'),
    ('Bié', 'BIE'),
    ('Cabinda', 'CAB'),
    ('Cuando Cubango', 'CCU'),
    ('Cuanza Norte', 'CNO'),
    ('Cuanza Sul', 'CSU'),
    ('Cunene', 'CUN'),
    ('Huambo', 'HUA'),
    ('Huíla', 'HUI'),
    ('Icolo e Bengo', 'ICB'),
    ('Luanda', 'LUA'),
    ('Lunda Norte', 'LNO'),
    ('Lunda Sul', 'LSU'),
    ('Malanje', 'MAL'),
    ('Moxico', 'MOX'),
    ('Namibe', 'NAM'),
    ('Uíge', 'UIG'),
    ('Zaire', 'ZAI');
