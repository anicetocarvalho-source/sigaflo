
-- =====================================================
-- MÓDULO DE PREPARAÇÃO PARA CRÉDITO E SEGURO AGRÍCOLA
-- =====================================================

-- 1. Perfil Financeiro Produtivo do Agricultor (PFPA)
CREATE TABLE public.farmer_financial_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  
  -- Dados calculados automaticamente
  production_years INTEGER DEFAULT 0,
  production_stability_pct DECIMAL(5,2) DEFAULT 0,
  average_annual_production_kg DECIMAL(12,2) DEFAULT 0,
  main_crops TEXT[] DEFAULT '{}',
  productive_area_ha DECIMAL(10,2) DEFAULT 0,
  
  -- Histórico de incentivos
  total_incentives_received_aoa DECIMAL(15,2) DEFAULT 0,
  incentives_count INTEGER DEFAULT 0,
  last_incentive_date DATE,
  
  -- Histórico climático
  climate_events_count INTEGER DEFAULT 0,
  climate_losses_aoa DECIMAL(15,2) DEFAULT 0,
  last_climate_event_date DATE,
  
  -- Risco territorial
  territorial_risk_level TEXT DEFAULT 'medium' CHECK (territorial_risk_level IN ('low', 'medium', 'high', 'very_high')),
  territorial_risk_factors JSONB DEFAULT '{}',
  
  -- Score e classificação
  credit_score INTEGER DEFAULT 0 CHECK (credit_score >= 0 AND credit_score <= 100),
  credit_score_factors JSONB DEFAULT '{}',
  risk_classification TEXT DEFAULT 'medium' CHECK (risk_classification IN ('low', 'medium', 'high')),
  
  -- Elegibilidade
  is_credit_eligible BOOLEAN DEFAULT FALSE,
  is_insurance_eligible BOOLEAN DEFAULT FALSE,
  eligibility_notes TEXT,
  
  -- Metadados
  last_calculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Simulações de Capacidade de Crédito
CREATE TABLE public.credit_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  
  -- Dados base
  simulation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scenario_type TEXT NOT NULL DEFAULT 'normal' CHECK (scenario_type IN ('normal', 'adverse', 'optimistic')),
  
  -- Receitas e custos
  expected_annual_revenue_aoa DECIMAL(15,2) NOT NULL DEFAULT 0,
  average_production_costs_aoa DECIMAL(15,2) NOT NULL DEFAULT 0,
  estimated_net_margin_aoa DECIMAL(15,2) NOT NULL DEFAULT 0,
  margin_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Capacidade de crédito
  max_monthly_payment_aoa DECIMAL(15,2) DEFAULT 0,
  max_credit_amount_aoa DECIMAL(15,2) DEFAULT 0,
  recommended_credit_amount_aoa DECIMAL(15,2) DEFAULT 0,
  recommended_term_months INTEGER DEFAULT 12,
  estimated_interest_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Parâmetros da simulação
  simulation_params JSONB DEFAULT '{}',
  
  -- Relatório
  report_generated BOOLEAN DEFAULT FALSE,
  report_url TEXT,
  qr_code_data TEXT,
  verification_url TEXT,
  
  -- Metadados
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Certificados de Histórico Produtivo
CREATE TABLE public.production_history_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  
  -- Período coberto
  period_start_year INTEGER NOT NULL,
  period_end_year INTEGER NOT NULL,
  
  -- Dados certificados
  certified_productions JSONB NOT NULL DEFAULT '[]',
  total_production_kg DECIMAL(15,2) DEFAULT 0,
  average_productivity DECIMAL(10,2) DEFAULT 0,
  productive_area_ha DECIMAL(10,2) DEFAULT 0,
  agricultural_practices TEXT[] DEFAULT '{}',
  
  -- Assinatura digital
  digital_signature TEXT,
  signed_by TEXT DEFAULT 'SIGAF/MINAGRIP',
  signed_at TIMESTAMPTZ,
  
  -- Verificação
  qr_code_data TEXT,
  verification_url TEXT,
  is_valid BOOLEAN DEFAULT TRUE,
  validity_expiry DATE,
  
  -- Status
  status TEXT DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'revoked', 'expired')),
  revocation_reason TEXT,
  
  -- Metadados
  issued_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Score de Risco para Seguro
CREATE TABLE public.insurance_risk_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  
  -- Factores de risco
  climate_history_score INTEGER DEFAULT 50,
  pest_frequency_score INTEGER DEFAULT 50,
  crop_risk_score INTEGER DEFAULT 50,
  practices_score INTEGER DEFAULT 50,
  extreme_events_score INTEGER DEFAULT 50,
  
  -- Score composto
  overall_risk_score INTEGER DEFAULT 50 CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  risk_factors_detail JSONB DEFAULT '{}',
  
  -- Classificação de seguro
  insurable_risk_class TEXT DEFAULT 'B' CHECK (insurable_risk_class IN ('A', 'B', 'C', 'D', 'E')),
  suggested_coverage_types TEXT[] DEFAULT '{}',
  suggested_premium_multiplier DECIMAL(4,2) DEFAULT 1.0,
  suggested_deductible_pct DECIMAL(5,2) DEFAULT 10.0,
  
  -- Recomendações
  coverage_recommendations JSONB DEFAULT '{}',
  risk_mitigation_suggestions TEXT[] DEFAULT '{}',
  
  -- Metadados
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Dossiê Digital de Crédito Agrícola
CREATE TABLE public.credit_dossiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  dossier_number TEXT NOT NULL UNIQUE,
  
  -- Componentes incluídos
  financial_profile_id UUID REFERENCES public.farmer_financial_profiles(id),
  simulation_id UUID REFERENCES public.credit_simulations(id),
  certificate_id UUID REFERENCES public.production_history_certificates(id),
  insurance_score_id UUID REFERENCES public.insurance_risk_scores(id),
  
  -- Dados consolidados
  credit_score INTEGER,
  risk_classification TEXT,
  recommended_credit_aoa DECIMAL(15,2),
  
  -- Mapas e documentos
  georeferenced_maps JSONB DEFAULT '{}',
  attached_documents JSONB DEFAULT '[]',
  
  -- Status de submissão
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'submitted', 'approved', 'rejected', 'expired')),
  submitted_to TEXT,
  submitted_at TIMESTAMPTZ,
  submission_response JSONB,
  
  -- Exportação
  pdf_url TEXT,
  qr_code_data TEXT,
  verification_url TEXT,
  
  -- Metadados
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at DATE
);

-- 6. Garantias Não-Convencionais
CREATE TABLE public.alternative_guarantees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  
  -- Tipo de garantia
  guarantee_type TEXT NOT NULL CHECK (guarantee_type IN ('future_production', 'supply_contract', 'sigaf_certificate', 'subsidy_history', 'equipment', 'other')),
  
  -- Detalhes
  description TEXT NOT NULL,
  estimated_value_aoa DECIMAL(15,2) DEFAULT 0,
  
  -- Documentação
  document_reference TEXT,
  document_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  
  -- Impacto no score
  score_impact_points INTEGER DEFAULT 0,
  
  -- Validade
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadados
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Alertas de Prontidão para Crédito e Seguro
CREATE TABLE public.credit_insurance_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  
  -- Tipo de alerta
  alert_type TEXT NOT NULL CHECK (alert_type IN ('credit_eligible', 'score_improved', 'insurance_recommended', 'document_expiring', 'profile_updated', 'dossier_ready')),
  
  -- Conteúdo
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Destinatários
  target_farmer BOOLEAN DEFAULT TRUE,
  target_extensionist BOOLEAN DEFAULT FALSE,
  target_institution TEXT,
  
  -- Canais de envio
  send_sms BOOLEAN DEFAULT FALSE,
  send_app BOOLEAN DEFAULT TRUE,
  send_email BOOLEAN DEFAULT FALSE,
  
  -- Status de envio
  sms_sent_at TIMESTAMPTZ,
  app_sent_at TIMESTAMPTZ,
  email_sent_at TIMESTAMPTZ,
  
  -- Leitura
  read_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- 8. Logs de Acesso Institucional (Bancos/Seguradoras)
CREATE TABLE public.institutional_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Instituição
  institution_type TEXT NOT NULL CHECK (institution_type IN ('bank', 'insurer', 'state')),
  institution_name TEXT NOT NULL,
  institution_code TEXT,
  
  -- Acesso
  access_type TEXT NOT NULL CHECK (access_type IN ('score_query', 'certificate_validation', 'dossier_view', 'application_submission')),
  farmer_id UUID REFERENCES public.farmers(id),
  resource_id UUID,
  resource_type TEXT,
  
  -- Consentimento
  farmer_consent_id UUID,
  consent_given_at TIMESTAMPTZ,
  
  -- Dados acedidos
  data_accessed JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  
  -- Resultado
  access_result TEXT CHECK (access_result IN ('success', 'denied', 'error')),
  error_message TEXT,
  
  -- Metadados
  accessed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Consentimentos do Agricultor
CREATE TABLE public.farmer_data_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  
  -- Instituição autorizada
  institution_type TEXT NOT NULL CHECK (institution_type IN ('bank', 'insurer', 'state', 'all')),
  institution_name TEXT,
  institution_code TEXT,
  
  -- Escopo do consentimento
  consent_scope TEXT[] NOT NULL DEFAULT '{}',
  
  -- Validade
  consent_given_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Revogação
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.farmer_financial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_history_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alternative_guarantees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_insurance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_data_consents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para leitura autenticada
CREATE POLICY "Allow authenticated read access to financial profiles" ON public.farmer_financial_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access to credit simulations" ON public.credit_simulations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access to production certificates" ON public.production_history_certificates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access to insurance scores" ON public.insurance_risk_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access to credit dossiers" ON public.credit_dossiers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access to guarantees" ON public.alternative_guarantees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access to alerts" ON public.credit_insurance_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access to access logs" ON public.institutional_access_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access to consents" ON public.farmer_data_consents FOR SELECT TO authenticated USING (true);

-- Políticas para inserção
CREATE POLICY "Allow authenticated insert to financial profiles" ON public.farmer_financial_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert to credit simulations" ON public.credit_simulations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert to production certificates" ON public.production_history_certificates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert to insurance scores" ON public.insurance_risk_scores FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert to credit dossiers" ON public.credit_dossiers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert to guarantees" ON public.alternative_guarantees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert to alerts" ON public.credit_insurance_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert to access logs" ON public.institutional_access_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated insert to consents" ON public.farmer_data_consents FOR INSERT TO authenticated WITH CHECK (true);

-- Políticas para actualização
CREATE POLICY "Allow authenticated update to financial profiles" ON public.farmer_financial_profiles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated update to credit simulations" ON public.credit_simulations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated update to production certificates" ON public.production_history_certificates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated update to insurance scores" ON public.insurance_risk_scores FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated update to credit dossiers" ON public.credit_dossiers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated update to guarantees" ON public.alternative_guarantees FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated update to alerts" ON public.credit_insurance_alerts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated update to consents" ON public.farmer_data_consents FOR UPDATE TO authenticated USING (true);

-- Políticas para eliminação
CREATE POLICY "Allow authenticated delete from guarantees" ON public.alternative_guarantees FOR DELETE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete from alerts" ON public.credit_insurance_alerts FOR DELETE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete from consents" ON public.farmer_data_consents FOR DELETE TO authenticated USING (true);

-- Índices para performance
CREATE INDEX idx_farmer_financial_profiles_farmer ON public.farmer_financial_profiles(farmer_id);
CREATE INDEX idx_farmer_financial_profiles_score ON public.farmer_financial_profiles(credit_score);
CREATE INDEX idx_credit_simulations_farmer ON public.credit_simulations(farmer_id);
CREATE INDEX idx_production_certificates_farmer ON public.production_history_certificates(farmer_id);
CREATE INDEX idx_insurance_risk_scores_farmer ON public.insurance_risk_scores(farmer_id);
CREATE INDEX idx_credit_dossiers_farmer ON public.credit_dossiers(farmer_id);
CREATE INDEX idx_credit_dossiers_status ON public.credit_dossiers(status);
CREATE INDEX idx_alternative_guarantees_farmer ON public.alternative_guarantees(farmer_id);
CREATE INDEX idx_credit_insurance_alerts_farmer ON public.credit_insurance_alerts(farmer_id);
CREATE INDEX idx_institutional_access_logs_farmer ON public.institutional_access_logs(farmer_id);
CREATE INDEX idx_institutional_access_logs_institution ON public.institutional_access_logs(institution_type, institution_name);

-- Trigger para updated_at
CREATE TRIGGER update_farmer_financial_profiles_updated_at BEFORE UPDATE ON public.farmer_financial_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_production_history_certificates_updated_at BEFORE UPDATE ON public.production_history_certificates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_insurance_risk_scores_updated_at BEFORE UPDATE ON public.insurance_risk_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_credit_dossiers_updated_at BEFORE UPDATE ON public.credit_dossiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_alternative_guarantees_updated_at BEFORE UPDATE ON public.alternative_guarantees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
