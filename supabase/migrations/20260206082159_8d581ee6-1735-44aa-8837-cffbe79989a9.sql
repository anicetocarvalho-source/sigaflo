
-- =============================================
-- SECURITY FIX 1: forest_complaints INSERT policy
-- Only allow anon to insert with required fields, restrict to 'pendente' status
-- =============================================
DROP POLICY IF EXISTS "Anyone can submit complaints" ON public.forest_complaints;

CREATE POLICY "Anyone can submit complaints with validation" 
ON public.forest_complaints 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- Complaints must have basic required fields
  complaint_type IS NOT NULL 
  AND description IS NOT NULL
  -- Force initial status to pendente
  AND status = 'pendente'
);

-- =============================================
-- SECURITY FIX 2: system_notifications INSERT policy
-- Only allow admins/technicians to create notifications, or users for themselves
-- =============================================
DROP POLICY IF EXISTS "System can create notifications for anyone" ON public.system_notifications;

CREATE POLICY "Admins can create notifications for anyone" 
ON public.system_notifications 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Users can only create notifications for themselves
  user_id = auth.uid()
  -- Or admins/technicians can create for anyone
  OR public.is_technician_or_admin(auth.uid())
);

-- =============================================
-- SECURITY FIX 3: Consolidate profiles SELECT policies
-- Remove redundant policies and keep clear ones
-- =============================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "National users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Provincial users can view same province profiles" ON public.profiles;

-- Single clean policy: users see own profile, admins see all, provincial users see same province
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  id = auth.uid()
  OR public.is_admin(auth.uid())
  OR public.is_national_level(auth.uid())
  OR (
    public.get_user_province(auth.uid()) IS NOT NULL 
    AND province_id = public.get_user_province(auth.uid())
  )
);

-- =============================================
-- SECURITY FIX 4: Restrict sensitive fields in profiles
-- Create a view that hides email/phone for non-admin users
-- =============================================
CREATE OR REPLACE VIEW public.profiles_safe AS
SELECT 
  id,
  full_name,
  position,
  department,
  avatar_url,
  province_id,
  municipality_id,
  entity_id,
  is_active,
  created_at,
  updated_at,
  CASE 
    WHEN id = auth.uid() OR public.is_admin(auth.uid()) THEN email
    ELSE NULL
  END as email,
  CASE 
    WHEN id = auth.uid() OR public.is_admin(auth.uid()) THEN phone
    ELSE NULL
  END as phone
FROM public.profiles;
