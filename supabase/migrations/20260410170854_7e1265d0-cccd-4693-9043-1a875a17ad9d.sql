
-- DELETE policy for production_history
CREATE POLICY "Technicians and admins can delete production records"
ON public.production_history
FOR DELETE
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- DELETE policy for agricultural_infrastructure
CREATE POLICY "Technicians and admins can delete agricultural infrastructure"
ON public.agricultural_infrastructure
FOR DELETE
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- DELETE policy for market_infrastructure
CREATE POLICY "Technicians and admins can delete market infrastructure"
ON public.market_infrastructure
FOR DELETE
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));
