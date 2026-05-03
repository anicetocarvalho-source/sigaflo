
-- 1. Fix can_access_province
CREATE OR REPLACE FUNCTION public.can_access_province(_user_id uuid, _province_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_national_level(_user_id) OR public.get_user_province(_user_id) = _province_id
$$;

-- 2. Drop stale permissive policies
DROP POLICY IF EXISTS "Eligibility rules deletable by authenticated" ON public.eligibility_rules;
DROP POLICY IF EXISTS "Eligibility rules insertable by authenticated" ON public.eligibility_rules;
DROP POLICY IF EXISTS "Eligibility rules updatable by authenticated" ON public.eligibility_rules;
DROP POLICY IF EXISTS "Allocations insertable by authenticated" ON public.incentive_allocations;
DROP POLICY IF EXISTS "Allocations updatable by authenticated" ON public.incentive_allocations;
DROP POLICY IF EXISTS "Allocations viewable by authenticated" ON public.incentive_allocations;
DROP POLICY IF EXISTS "Risk metrics insertable by authenticated" ON public.province_risk_metrics;
DROP POLICY IF EXISTS "Risk metrics updatable by authenticated" ON public.province_risk_metrics;
DROP POLICY IF EXISTS "Risk metrics viewable by authenticated" ON public.province_risk_metrics;
DROP POLICY IF EXISTS "Transport permits insertable by authenticated" ON public.forest_transport_permits;
DROP POLICY IF EXISTS "Transport permits updatable by authenticated" ON public.forest_transport_permits;
DROP POLICY IF EXISTS "Transport permits viewable by authenticated" ON public.forest_transport_permits;
DROP POLICY IF EXISTS "Alerts insertable by authenticated" ON public.occurrence_alerts;
DROP POLICY IF EXISTS "Alerts updatable by authenticated" ON public.occurrence_alerts;
DROP POLICY IF EXISTS "Alerts viewable by authenticated" ON public.occurrence_alerts;
DROP POLICY IF EXISTS "Rice production editable by authenticated" ON public.rice_production;
DROP POLICY IF EXISTS "Rice prices editable by authenticated" ON public.rice_prices;
DROP POLICY IF EXISTS "Rice consumption editable by authenticated" ON public.rice_consumption;
DROP POLICY IF EXISTS "Rice imports editable by authenticated" ON public.rice_imports;

CREATE POLICY "Admin can delete eligibility rules"
ON public.eligibility_rules FOR DELETE TO authenticated
USING (is_admin(auth.uid()));

-- 3. Forest transport permits public verification view (no PII)
DROP POLICY IF EXISTS "Public can verify transport permits" ON public.forest_transport_permits;

CREATE OR REPLACE VIEW public.transport_permits_verification_public AS
SELECT
  id,
  permit_number,
  status,
  valid_until,
  total_volume_m3,
  species_summary,
  origin_location,
  destination_location,
  vehicle_plate,
  issue_date,
  departure_at,
  arrival_at
FROM public.forest_transport_permits;

GRANT SELECT ON public.transport_permits_verification_public TO anon, authenticated;

-- 4. Storage policies for farmer-documents
DROP POLICY IF EXISTS "Anyone can view farmer documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete farmer documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update farmer documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload farmer documents" ON storage.objects;

CREATE POLICY "Staff can view farmer documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'farmer-documents' AND public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can upload farmer documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'farmer-documents' AND public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update farmer documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'farmer-documents' AND public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can delete farmer documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'farmer-documents' AND public.is_technician_or_admin(auth.uid()));

UPDATE storage.buckets SET public = false WHERE id = 'farmer-documents';

-- 5. Move pin_hash to a separate, more restricted table
CREATE TABLE IF NOT EXISTS public.farmer_wallet_pins (
  wallet_id uuid PRIMARY KEY REFERENCES public.farmer_wallets(id) ON DELETE CASCADE,
  pin_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.farmer_wallet_pins (wallet_id, pin_hash)
SELECT id, pin_hash FROM public.farmer_wallets WHERE pin_hash IS NOT NULL
ON CONFLICT (wallet_id) DO NOTHING;

ALTER TABLE public.farmer_wallets DROP COLUMN IF EXISTS pin_hash;

ALTER TABLE public.farmer_wallet_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage wallet pins"
ON public.farmer_wallet_pins FOR ALL TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.verify_farmer_wallet_pin(_wallet_id uuid, _pin_hash text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.farmer_wallet_pins
    WHERE wallet_id = _wallet_id AND pin_hash = _pin_hash
  )
$$;
REVOKE ALL ON FUNCTION public.verify_farmer_wallet_pin(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.verify_farmer_wallet_pin(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_farmer_wallet_pin(_wallet_id uuid, _pin_hash text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_technician_or_admin(auth.uid()) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;
  INSERT INTO public.farmer_wallet_pins (wallet_id, pin_hash, updated_at)
  VALUES (_wallet_id, _pin_hash, now())
  ON CONFLICT (wallet_id) DO UPDATE SET pin_hash = EXCLUDED.pin_hash, updated_at = now();
END;
$$;
REVOKE ALL ON FUNCTION public.set_farmer_wallet_pin(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.set_farmer_wallet_pin(uuid, text) TO authenticated;
