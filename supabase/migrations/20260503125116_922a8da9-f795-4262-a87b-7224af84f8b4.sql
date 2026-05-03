
-- system_notifications: restrict NULL user_id to admins
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.system_notifications;
CREATE POLICY "Users can view their own notifications"
ON public.system_notifications FOR SELECT TO authenticated
USING (user_id = auth.uid() OR (user_id IS NULL AND public.is_admin(auth.uid())));

-- farmer_parcels: restrict read to staff
DROP POLICY IF EXISTS "Viewers can read parcels" ON public.farmer_parcels;
CREATE POLICY "Staff can read parcels"
ON public.farmer_parcels FOR SELECT TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- farmer_representatives: restrict read to staff
DROP POLICY IF EXISTS "Viewers can read representatives" ON public.farmer_representatives;
CREATE POLICY "Staff can read representatives"
ON public.farmer_representatives FOR SELECT TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- incentive_impacts: drop stale permissive policies
DROP POLICY IF EXISTS "Impacts insertable by authenticated" ON public.incentive_impacts;
DROP POLICY IF EXISTS "Impacts viewable by authenticated" ON public.incentive_impacts;
