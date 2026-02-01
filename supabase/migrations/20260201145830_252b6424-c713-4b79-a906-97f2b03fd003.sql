-- ============================================================================
-- SIGAF: Fix farmers RLS - Jurisdictional access control
-- ============================================================================

-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Farmers viewable by everyone" ON public.farmers;

-- Create jurisdictional policy: national staff see all, others see their province
CREATE POLICY "Users can view farmers in their jurisdiction" 
ON public.farmers FOR SELECT 
TO authenticated
USING (
  public.is_national_level(auth.uid()) 
  OR province_id = public.get_user_province(auth.uid())
);