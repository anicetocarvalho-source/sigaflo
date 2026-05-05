
-- 1) farmer_wallet_pins: drop client-facing ALL policy, replace with non-SELECT admin policies
DROP POLICY IF EXISTS "Admin can manage wallet pins" ON public.farmer_wallet_pins;

REVOKE SELECT ON public.farmer_wallet_pins FROM anon, authenticated;

CREATE POLICY "Admins can insert wallet pins"
ON public.farmer_wallet_pins
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update wallet pins"
ON public.farmer_wallet_pins
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete wallet pins"
ON public.farmer_wallet_pins
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 2) Fix can_access_province: NULL user province must NOT match other rows
CREATE OR REPLACE FUNCTION public.can_access_province(_province_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_prov uuid;
BEGIN
  IF public.is_national_level(auth.uid()) THEN
    RETURN TRUE;
  END IF;
  user_prov := public.get_user_province(auth.uid());
  IF user_prov IS NULL OR _province_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN user_prov = _province_id;
END;
$$;

-- Replace direct province_id = get_user_province(auth.uid()) policy on farmers
DROP POLICY IF EXISTS "Users can view farmers in their jurisdiction" ON public.farmers;

CREATE POLICY "Users can view farmers in their jurisdiction"
ON public.farmers
FOR SELECT
TO authenticated
USING (public.can_access_province(province_id));

-- 3) system_notifications broadcast visibility
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.system_notifications;

CREATE POLICY "Users can view their own notifications"
ON public.system_notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

-- 4) Remove stale permissive insert policy on rice_alerts
DROP POLICY IF EXISTS "Rice alerts editable by authenticated" ON public.rice_alerts;
