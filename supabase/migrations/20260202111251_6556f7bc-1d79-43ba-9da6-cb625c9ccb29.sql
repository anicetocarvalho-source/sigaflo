-- ==============================================
-- Tabelas de Infraestruturas
-- ==============================================

-- Infraestruturas Agropecuárias
CREATE TABLE public.agricultural_infrastructure (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  infrastructure_type TEXT NOT NULL CHECK (infrastructure_type IN ('warehouse', 'silo', 'irrigation', 'processing', 'cold_storage', 'logistics')),
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  commune_id UUID REFERENCES public.communes(id),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity DECIMAL(15, 2),
  capacity_unit TEXT DEFAULT 'toneladas',
  current_occupancy DECIMAL(15, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'inactive', 'construction')),
  condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  built_year INTEGER,
  last_inspection_date DATE,
  manager_name TEXT,
  manager_contact TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Infraestruturas de Mercados
CREATE TABLE public.market_infrastructure (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  market_type TEXT NOT NULL CHECK (market_type IN ('wholesale', 'retail', 'fish_market', 'agricultural_fair', 'distribution_center', 'livestock_market')),
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  commune_id UUID REFERENCES public.communes(id),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity_sqm DECIMAL(15, 2),
  stalls_count INTEGER DEFAULT 0,
  current_occupancy INTEGER DEFAULT 0,
  vendors_count INTEGER DEFAULT 0,
  daily_visitors_estimate INTEGER DEFAULT 0,
  products TEXT[],
  status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'under_maintenance', 'closed', 'under_construction')),
  condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  last_inspection_date DATE,
  manager_name TEXT,
  manager_contact TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- ==============================================
-- Tabela de Notificações do Sistema
-- ==============================================

CREATE TABLE public.system_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'info' CHECK (notification_type IN ('info', 'success', 'warning', 'error')),
  category TEXT NOT NULL DEFAULT 'system' CHECK (category IN ('system', 'farmers', 'certificates', 'occurrences', 'forestry', 'coffee', 'incentives', 'credit', 'infrastructure')),
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- ==============================================
-- Tabela de Configurações do Sistema
-- ==============================================

CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Configurações de Preferências do Utilizador
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  notifications_email BOOLEAN DEFAULT true,
  notifications_push BOOLEAN DEFAULT true,
  notifications_sms BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'pt',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  default_province_id UUID REFERENCES public.provinces(id),
  dashboard_layout JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==============================================
-- Índices para Performance
-- ==============================================

CREATE INDEX idx_agricultural_infrastructure_province ON public.agricultural_infrastructure(province_id);
CREATE INDEX idx_agricultural_infrastructure_type ON public.agricultural_infrastructure(infrastructure_type);
CREATE INDEX idx_agricultural_infrastructure_status ON public.agricultural_infrastructure(status);

CREATE INDEX idx_market_infrastructure_province ON public.market_infrastructure(province_id);
CREATE INDEX idx_market_infrastructure_type ON public.market_infrastructure(market_type);
CREATE INDEX idx_market_infrastructure_status ON public.market_infrastructure(status);

CREATE INDEX idx_system_notifications_user ON public.system_notifications(user_id);
CREATE INDEX idx_system_notifications_category ON public.system_notifications(category);
CREATE INDEX idx_system_notifications_unread ON public.system_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_system_notifications_created ON public.system_notifications(created_at DESC);

-- ==============================================
-- RLS Policies
-- ==============================================

-- Agricultural Infrastructure
ALTER TABLE public.agricultural_infrastructure ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view infrastructure"
  ON public.agricultural_infrastructure FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Technicians can manage infrastructure"
  ON public.agricultural_infrastructure FOR ALL
  TO authenticated
  USING (public.is_technician_or_admin(auth.uid()))
  WITH CHECK (public.is_technician_or_admin(auth.uid()));

-- Market Infrastructure
ALTER TABLE public.market_infrastructure ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view markets"
  ON public.market_infrastructure FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Technicians can manage markets"
  ON public.market_infrastructure FOR ALL
  TO authenticated
  USING (public.is_technician_or_admin(auth.uid()))
  WITH CHECK (public.is_technician_or_admin(auth.uid()));

-- System Notifications
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.system_notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own notifications"
  ON public.system_notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications for anyone"
  ON public.system_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
  ON public.system_notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- System Settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public settings"
  ON public.system_settings FOR SELECT
  TO authenticated
  USING (is_public = true OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage settings"
  ON public.system_settings FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- User Preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own preferences"
  ON public.user_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ==============================================
-- Triggers para updated_at
-- ==============================================

CREATE TRIGGER update_agricultural_infrastructure_updated_at
  BEFORE UPDATE ON public.agricultural_infrastructure
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_infrastructure_updated_at
  BEFORE UPDATE ON public.market_infrastructure
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- Enable Realtime para Notificações
-- ==============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.system_notifications;