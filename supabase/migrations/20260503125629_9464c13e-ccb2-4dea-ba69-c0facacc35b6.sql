
DROP POLICY IF EXISTS "Rice parameters editable by admins" ON public.rice_parameters;
CREATE POLICY "Rice parameters editable by admins"
ON public.rice_parameters FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
