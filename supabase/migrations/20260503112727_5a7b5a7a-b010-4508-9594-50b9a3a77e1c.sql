
DROP VIEW IF EXISTS public.transport_permits_verification_public;
CREATE VIEW public.transport_permits_verification_public
WITH (security_invoker = on) AS
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

-- Re-allow anon SELECT on base table so security_invoker view can read; the view exposes only safe columns.
-- However, we don't want anon hitting base table directly via PostgREST (PII risk).
-- Solution: keep base SELECT for anon disallowed; instead, add a SECURITY DEFINER function for verification.
-- Drop view and replace with a safe RPC function:
DROP VIEW IF EXISTS public.transport_permits_verification_public;

CREATE OR REPLACE FUNCTION public.verify_transport_permit(_permit_number text)
RETURNS TABLE (
  id uuid,
  permit_number text,
  status text,
  valid_until timestamptz,
  total_volume_m3 numeric,
  species_summary jsonb,
  origin_location text,
  destination_location text,
  vehicle_plate text,
  issue_date timestamptz,
  departure_at timestamptz,
  arrival_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, permit_number, status, valid_until, total_volume_m3, species_summary,
         origin_location, destination_location, vehicle_plate, issue_date, departure_at, arrival_at
  FROM public.forest_transport_permits
  WHERE permit_number = _permit_number
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.verify_transport_permit(text) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_transport_permit(text) TO anon, authenticated;
