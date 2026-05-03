
DROP POLICY IF EXISTS "Viewers can read purchases" ON public.subsidized_purchases;
CREATE POLICY "Staff can read purchases" ON public.subsidized_purchases FOR SELECT TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Viewers can read invoices" ON public.invoices;
CREATE POLICY "Staff can read invoices" ON public.invoices FOR SELECT TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Viewers can read sales" ON public.pos_sales;
CREATE POLICY "Staff can read sales" ON public.pos_sales FOR SELECT TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Viewers can read sale items" ON public.pos_sale_items;
CREATE POLICY "Staff can read sale items" ON public.pos_sale_items FOR SELECT TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Viewers can read campaigns" ON public.farmer_campaigns;
CREATE POLICY "Staff can read campaigns" ON public.farmer_campaigns FOR SELECT TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Viewers can read packages" ON public.purchase_packages;
CREATE POLICY "Staff can read packages" ON public.purchase_packages FOR SELECT TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Viewers can read package items" ON public.purchase_package_items;
CREATE POLICY "Staff can read package items" ON public.purchase_package_items FOR SELECT TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Viewers can read polygons" ON public.parcel_polygons;
CREATE POLICY "Staff can read polygons" ON public.parcel_polygons FOR SELECT TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Rice alerts editable by authenticated" ON public.rice_alerts;
