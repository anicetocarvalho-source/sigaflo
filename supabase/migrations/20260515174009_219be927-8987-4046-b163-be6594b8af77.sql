-- 1. Enum de módulos
DO $$ BEGIN
  CREATE TYPE public.app_module AS ENUM (
    'farmers',
    'forestry',
    'coffee',
    'rice',
    'pos',
    'mechanization',
    'credit_insurance',
    'incentives',
    'climate_risk',
    'ipn',
    'data_lab',
    'occurrences'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Tabela de permissões por módulo
CREATE TABLE IF NOT EXISTS public.module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module public.app_module NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID,
  UNIQUE (user_id, module)
);

CREATE INDEX IF NOT EXISTS idx_module_permissions_user ON public.module_permissions(user_id);

ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

-- Self read
DROP POLICY IF EXISTS "Users view own module permissions" ON public.module_permissions;
CREATE POLICY "Users view own module permissions"
  ON public.module_permissions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Only national admins manage
DROP POLICY IF EXISTS "National admins manage module permissions" ON public.module_permissions;
CREATE POLICY "National admins manage module permissions"
  ON public.module_permissions FOR ALL
  USING (public.has_role(auth.uid(), 'admin_national'))
  WITH CHECK (public.has_role(auth.uid(), 'admin_national'));

-- 3. Função de verificação de acesso por módulo
-- Regra: administradores OU utilizadores SEM permissões registadas mantêm acesso total.
-- Utilizadores com pelo menos uma linha em module_permissions ficam restritos a esses módulos.
CREATE OR REPLACE FUNCTION public.has_module_access(_user_id UUID, _module public.app_module)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_admin(_user_id)
    OR NOT EXISTS (SELECT 1 FROM public.module_permissions WHERE user_id = _user_id)
    OR EXISTS (
      SELECT 1 FROM public.module_permissions
      WHERE user_id = _user_id AND module = _module
    )
$$;

-- 4. Helper para o frontend listar módulos do utilizador autenticado
CREATE OR REPLACE FUNCTION public.get_my_module_permissions()
RETURNS SETOF public.app_module
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT module FROM public.module_permissions WHERE user_id = auth.uid()
$$;