-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM (
  'admin_national',      -- Administrador Nacional (acesso total)
  'admin_provincial',    -- Administrador Provincial
  'admin_municipal',     -- Administrador Municipal
  'technician_national', -- Técnico Nacional
  'technician_provincial', -- Técnico Provincial
  'technician_municipal',  -- Técnico Municipal
  'private_entity',      -- Entidade Privada (cooperativas, empresas)
  'viewer'               -- Apenas visualização
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  position TEXT,           -- Cargo
  department TEXT,         -- Departamento
  avatar_url TEXT,         -- URL da foto (armazenada em storage)
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  entity_id UUID REFERENCES public.farmers(id), -- Para entidades privadas (cooperativas/empresas)
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user has any admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('admin_national', 'admin_provincial', 'admin_municipal')
  )
$$;

-- Function to check if user is national level (admin or technician)
CREATE OR REPLACE FUNCTION public.is_national_level(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('admin_national', 'technician_national')
  )
$$;

-- Function to get user's province_id
CREATE OR REPLACE FUNCTION public.get_user_province(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT province_id FROM public.profiles WHERE id = _user_id
$$;

-- Function to get user's municipality_id
CREATE OR REPLACE FUNCTION public.get_user_municipality(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT municipality_id FROM public.profiles WHERE id = _user_id
$$;

-- Function to check if user can manage another user based on hierarchy
CREATE OR REPLACE FUNCTION public.can_manage_user(_manager_id UUID, _target_role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _manager_id
    AND (
      -- National admin can manage everyone
      (ur.role = 'admin_national') OR
      -- Provincial admin can manage provincial/municipal levels and below
      (ur.role = 'admin_provincial' AND _target_role IN (
        'admin_provincial', 'admin_municipal', 
        'technician_provincial', 'technician_municipal',
        'private_entity', 'viewer'
      )) OR
      -- Municipal admin can manage municipal level and below
      (ur.role = 'admin_municipal' AND _target_role IN (
        'admin_municipal', 'technician_municipal',
        'private_entity', 'viewer'
      ))
    )
  )
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "National users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_national_level(auth.uid()));

CREATE POLICY "Provincial users can view same province profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  province_id = public.get_user_province(auth.uid())
  AND public.get_user_province(auth.uid()) IS NOT NULL
);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()) OR id = auth.uid());

-- User roles RLS policies
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles based on hierarchy"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.can_manage_user(auth.uid(), role));

CREATE POLICY "Admins can update roles based on hierarchy"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.can_manage_user(auth.uid(), role));

CREATE POLICY "Admins can delete roles based on hierarchy"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.can_manage_user(auth.uid(), role));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, position, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'position',
    NEW.raw_user_meta_data ->> 'department'
  );
  RETURN NEW;
END;
$$;

-- Trigger the function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();