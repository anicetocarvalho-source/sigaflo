
-- Fix the profiles_safe view to use security_invoker instead of security_definer
DROP VIEW IF EXISTS public.profiles_safe;

CREATE VIEW public.profiles_safe
WITH (security_invoker = on) AS
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
