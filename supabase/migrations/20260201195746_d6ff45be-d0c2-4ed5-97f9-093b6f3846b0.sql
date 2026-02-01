-- ============================================================================
-- SIGAFLO: All Public Verification Views + Policy Cleanup (Complete)
-- ============================================================================

-- 1. Agricultural Certificates - Public verification view
CREATE OR REPLACE VIEW public.certificate_verification_public
WITH (security_invoker = on) AS
SELECT 
  certificate_number,
  status,
  certificate_type,
  issue_date,
  expiry_date,
  year,
  season,
  verification_url
FROM public.agricultural_certificates
WHERE status = 'issued';

-- 2. Coffee Lots - Public verification view (no commercial details)
CREATE OR REPLACE VIEW public.coffee_verification_public
WITH (security_invoker = on) AS
SELECT 
  lot_code,
  status,
  variety,
  processing_method,
  quality_grade,
  origin_location,
  harvest_year,
  harvest_season
FROM public.coffee_lots;

-- 3. Forest Licenses - Public verification view (no operator details)
CREATE OR REPLACE VIEW public.license_verification_public
WITH (security_invoker = on) AS
SELECT 
  license_number,
  license_type,
  status,
  issue_date,
  expiry_date
FROM public.forest_licenses;

-- 4. Forest Logs - Public verification view (no location/destination)
CREATE OR REPLACE VIEW public.log_verification_public
WITH (security_invoker = on) AS
SELECT 
  log_code,
  species,
  status,
  logged_at
FROM public.forest_logs;

-- 5. Transport Permits - Public verification view (no driver info)
CREATE OR REPLACE VIEW public.permit_verification_public
WITH (security_invoker = on) AS
SELECT 
  permit_number,
  status,
  issue_date,
  valid_until
FROM public.forest_transport_permits;

-- ============================================================================
-- REMOVE PUBLIC ACCESS POLICIES FROM BASE TABLES
-- ============================================================================

DROP POLICY IF EXISTS "Public can verify certificates by code" ON public.agricultural_certificates;
DROP POLICY IF EXISTS "Public can verify coffee by code" ON public.coffee_lots;
DROP POLICY IF EXISTS "Public can verify licenses" ON public.forest_licenses;
DROP POLICY IF EXISTS "Public can verify logs" ON public.forest_logs;
DROP POLICY IF EXISTS "Public can verify permits" ON public.forest_transport_permits;

-- ============================================================================
-- GRANT ACCESS TO PUBLIC VIEWS
-- ============================================================================

GRANT SELECT ON public.certificate_verification_public TO anon, authenticated;
GRANT SELECT ON public.coffee_verification_public TO anon, authenticated;
GRANT SELECT ON public.license_verification_public TO anon, authenticated;
GRANT SELECT ON public.log_verification_public TO anon, authenticated;
GRANT SELECT ON public.permit_verification_public TO anon, authenticated;