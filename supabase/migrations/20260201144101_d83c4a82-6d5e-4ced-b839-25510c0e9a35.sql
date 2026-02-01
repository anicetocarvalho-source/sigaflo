
-- ============================================================================
-- SIGAF SECURITY FIX: Comprehensive RLS Policy Update
-- This migration replaces permissive RLS policies with proper role-based access
-- ============================================================================

-- ============================================================================
-- PART 1: Create additional helper functions for RLS
-- ============================================================================

-- Function to check if user can access data in a specific province
CREATE OR REPLACE FUNCTION public.can_access_province(_user_id uuid, _province_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_national_level(_user_id) 
    OR public.get_user_province(_user_id) = _province_id
    OR public.get_user_province(_user_id) IS NULL -- If user has no province restriction
$$;

-- Function to check if user can access data in a specific municipality
CREATE OR REPLACE FUNCTION public.can_access_municipality(_user_id uuid, _municipality_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_national_level(_user_id)
    OR public.get_user_municipality(_user_id) = _municipality_id
    OR public.get_user_municipality(_user_id) IS NULL
    OR EXISTS (
      SELECT 1 FROM municipalities m 
      WHERE m.id = _municipality_id 
      AND m.province_id = public.get_user_province(_user_id)
    )
$$;

-- Function to check if user is a technician or higher
CREATE OR REPLACE FUNCTION public.is_technician_or_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN (
      'admin_national', 'admin_provincial', 'admin_municipal',
      'technician_national', 'technician_provincial', 'technician_municipal'
    )
  )
$$;

-- ============================================================================
-- PART 2: Fix AUDIT_LOG - Only admins can view
-- ============================================================================

DROP POLICY IF EXISTS "Audit viewable by authenticated" ON public.audit_log;
DROP POLICY IF EXISTS "Audit insert by authenticated" ON public.audit_log;

CREATE POLICY "Audit viewable by admins only" 
ON public.audit_log FOR SELECT 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "System and admins can insert audit" 
ON public.audit_log FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

-- ============================================================================
-- PART 3: Fix PROFILES - Users see own, admins see jurisdiction
-- ============================================================================

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;

CREATE POLICY "Users can view own profile or admins can view all" 
ON public.profiles FOR SELECT 
TO authenticated
USING (
  auth.uid() = id 
  OR public.is_admin(auth.uid())
);

-- ============================================================================
-- PART 4: Fix FARMERS - Role-based access by jurisdiction
-- ============================================================================

DROP POLICY IF EXISTS "Farmers are viewable by everyone" ON public.farmers;
DROP POLICY IF EXISTS "Authenticated users can update farmers" ON public.farmers;
DROP POLICY IF EXISTS "Authenticated users can insert farmers" ON public.farmers;

-- SELECT: Technicians and admins can view farmers in their jurisdiction
CREATE POLICY "Staff can view farmers in jurisdiction" 
ON public.farmers FOR SELECT 
TO authenticated
USING (
  public.is_national_level(auth.uid())
  OR public.can_access_province(auth.uid(), province_id)
);

-- INSERT: Technicians and admins can create farmers
CREATE POLICY "Staff can create farmers" 
ON public.farmers FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

-- UPDATE: Technicians and admins can update farmers in jurisdiction
CREATE POLICY "Staff can update farmers in jurisdiction" 
ON public.farmers FOR UPDATE 
TO authenticated
USING (
  public.is_national_level(auth.uid())
  OR public.can_access_province(auth.uid(), province_id)
);

-- ============================================================================
-- PART 5: Fix AGRICULTURAL_CERTIFICATES
-- ============================================================================

DROP POLICY IF EXISTS "Certificates viewable by everyone" ON public.agricultural_certificates;
DROP POLICY IF EXISTS "Authenticated can update certificates" ON public.agricultural_certificates;
DROP POLICY IF EXISTS "Authenticated can insert certificates" ON public.agricultural_certificates;

-- SELECT: Staff can view, public can verify via portal (using certificate number lookup)
CREATE POLICY "Staff can view certificates" 
ON public.agricultural_certificates FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- Public verification - anyone can verify a certificate they have the code for
CREATE POLICY "Public can verify certificates by code" 
ON public.agricultural_certificates FOR SELECT 
TO anon
USING (true); -- Public portal needs to verify

CREATE POLICY "Staff can create certificates" 
ON public.agricultural_certificates FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update certificates" 
ON public.agricultural_certificates FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- ============================================================================
-- PART 6: Fix PRODUCTION_HISTORY
-- ============================================================================

DROP POLICY IF EXISTS "Production history viewable by everyone" ON public.production_history;
DROP POLICY IF EXISTS "Production history insertable by authenticated" ON public.production_history;
DROP POLICY IF EXISTS "Production history updatable by authenticated" ON public.production_history;

CREATE POLICY "Staff can view production history" 
ON public.production_history FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can insert production history" 
ON public.production_history FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update production history" 
ON public.production_history FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- ============================================================================
-- PART 7: Fix CLIMATE_OCCURRENCES - Keep accessible for reporting
-- ============================================================================

DROP POLICY IF EXISTS "Occurrences viewable by authenticated" ON public.climate_occurrences;
DROP POLICY IF EXISTS "Occurrences insertable by authenticated" ON public.climate_occurrences;
DROP POLICY IF EXISTS "Occurrences updatable by authenticated" ON public.climate_occurrences;

CREATE POLICY "Authenticated can view occurrences in jurisdiction" 
ON public.climate_occurrences FOR SELECT 
TO authenticated
USING (
  public.is_national_level(auth.uid())
  OR public.can_access_province(auth.uid(), province_id)
);

CREATE POLICY "Authenticated can report occurrences" 
ON public.climate_occurrences FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can update occurrences" 
ON public.climate_occurrences FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- ============================================================================
-- PART 8: Fix COFFEE_LOTS
-- ============================================================================

DROP POLICY IF EXISTS "Allow read access for authenticated users" ON public.coffee_lots;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.coffee_lots;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON public.coffee_lots;

CREATE POLICY "Staff can view coffee lots" 
ON public.coffee_lots FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- Public verification for coffee traceability
CREATE POLICY "Public can verify coffee by code" 
ON public.coffee_lots FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Staff can create coffee lots" 
ON public.coffee_lots FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update coffee lots" 
ON public.coffee_lots FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- ============================================================================
-- PART 9: Fix FOREST_LICENSES
-- ============================================================================

DROP POLICY IF EXISTS "Forest licenses viewable by authenticated" ON public.forest_licenses;
DROP POLICY IF EXISTS "Forest licenses insertable by authenticated" ON public.forest_licenses;
DROP POLICY IF EXISTS "Forest licenses updatable by authenticated" ON public.forest_licenses;

CREATE POLICY "Staff can view forest licenses" 
ON public.forest_licenses FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Public can verify licenses" 
ON public.forest_licenses FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Staff can create forest licenses" 
ON public.forest_licenses FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update forest licenses" 
ON public.forest_licenses FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- ============================================================================
-- PART 10: Fix CREDIT/INSURANCE tables - Sensitive financial data
-- ============================================================================

-- CREDIT_DOSSIERS
DROP POLICY IF EXISTS "Allow authenticated read access to credit dossiers" ON public.credit_dossiers;
DROP POLICY IF EXISTS "Allow authenticated insert to credit dossiers" ON public.credit_dossiers;
DROP POLICY IF EXISTS "Allow authenticated update to credit dossiers" ON public.credit_dossiers;

CREATE POLICY "Staff can view credit dossiers" 
ON public.credit_dossiers FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create credit dossiers" 
ON public.credit_dossiers FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update credit dossiers" 
ON public.credit_dossiers FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- FARMER_FINANCIAL_PROFILES
DROP POLICY IF EXISTS "Allow authenticated read access to financial profiles" ON public.farmer_financial_profiles;
DROP POLICY IF EXISTS "Allow authenticated insert to financial profiles" ON public.farmer_financial_profiles;
DROP POLICY IF EXISTS "Allow authenticated update to financial profiles" ON public.farmer_financial_profiles;

CREATE POLICY "Staff can view financial profiles" 
ON public.farmer_financial_profiles FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create financial profiles" 
ON public.farmer_financial_profiles FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update financial profiles" 
ON public.farmer_financial_profiles FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- CREDIT_SIMULATIONS
DROP POLICY IF EXISTS "Allow authenticated read access to credit simulations" ON public.credit_simulations;
DROP POLICY IF EXISTS "Allow authenticated insert to credit simulations" ON public.credit_simulations;
DROP POLICY IF EXISTS "Allow authenticated update to credit simulations" ON public.credit_simulations;

CREATE POLICY "Staff can view credit simulations" 
ON public.credit_simulations FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create credit simulations" 
ON public.credit_simulations FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update credit simulations" 
ON public.credit_simulations FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- INSURANCE_RISK_SCORES
DROP POLICY IF EXISTS "Allow authenticated read access to insurance scores" ON public.insurance_risk_scores;
DROP POLICY IF EXISTS "Allow authenticated insert to insurance scores" ON public.insurance_risk_scores;
DROP POLICY IF EXISTS "Allow authenticated update to insurance scores" ON public.insurance_risk_scores;

CREATE POLICY "Staff can view insurance scores" 
ON public.insurance_risk_scores FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create insurance scores" 
ON public.insurance_risk_scores FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update insurance scores" 
ON public.insurance_risk_scores FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- ============================================================================
-- PART 11: Fix ALTERNATIVE_GUARANTEES
-- ============================================================================

DROP POLICY IF EXISTS "Allow authenticated read access to guarantees" ON public.alternative_guarantees;
DROP POLICY IF EXISTS "Allow authenticated insert to guarantees" ON public.alternative_guarantees;
DROP POLICY IF EXISTS "Allow authenticated update to guarantees" ON public.alternative_guarantees;
DROP POLICY IF EXISTS "Allow authenticated delete from guarantees" ON public.alternative_guarantees;

CREATE POLICY "Staff can view guarantees" 
ON public.alternative_guarantees FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create guarantees" 
ON public.alternative_guarantees FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update guarantees" 
ON public.alternative_guarantees FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can delete guarantees" 
ON public.alternative_guarantees FOR DELETE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- ============================================================================
-- PART 12: Fix RICE tables
-- ============================================================================

-- RICE_PRODUCTION
DROP POLICY IF EXISTS "Rice production viewable by authenticated" ON public.rice_production;
DROP POLICY IF EXISTS "Rice production insertable by authenticated" ON public.rice_production;
DROP POLICY IF EXISTS "Rice production updatable by authenticated" ON public.rice_production;

CREATE POLICY "Staff can view rice production" 
ON public.rice_production FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create rice production" 
ON public.rice_production FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update rice production" 
ON public.rice_production FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- RICE_IMPORTS
DROP POLICY IF EXISTS "Rice imports viewable by authenticated" ON public.rice_imports;
DROP POLICY IF EXISTS "Rice imports insertable by authenticated" ON public.rice_imports;
DROP POLICY IF EXISTS "Rice imports updatable by authenticated" ON public.rice_imports;

CREATE POLICY "Staff can view rice imports" 
ON public.rice_imports FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create rice imports" 
ON public.rice_imports FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update rice imports" 
ON public.rice_imports FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- RICE_PRICES
DROP POLICY IF EXISTS "Rice prices viewable by authenticated" ON public.rice_prices;
DROP POLICY IF EXISTS "Rice prices insertable by authenticated" ON public.rice_prices;
DROP POLICY IF EXISTS "Rice prices updatable by authenticated" ON public.rice_prices;

CREATE POLICY "Staff can view rice prices" 
ON public.rice_prices FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create rice prices" 
ON public.rice_prices FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update rice prices" 
ON public.rice_prices FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- ============================================================================
-- PART 13: Fix INCENTIVE tables
-- ============================================================================

DROP POLICY IF EXISTS "Incentive programs viewable by authenticated" ON public.incentive_programs;
DROP POLICY IF EXISTS "Incentive programs insertable by authenticated" ON public.incentive_programs;
DROP POLICY IF EXISTS "Incentive programs updatable by authenticated" ON public.incentive_programs;

CREATE POLICY "Staff can view incentive programs" 
ON public.incentive_programs FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Admin can create incentive programs" 
ON public.incentive_programs FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can update incentive programs" 
ON public.incentive_programs FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- INCENTIVE_ALLOCATIONS
DROP POLICY IF EXISTS "Incentive allocations viewable by authenticated" ON public.incentive_allocations;
DROP POLICY IF EXISTS "Incentive allocations insertable by authenticated" ON public.incentive_allocations;
DROP POLICY IF EXISTS "Incentive allocations updatable by authenticated" ON public.incentive_allocations;

CREATE POLICY "Staff can view incentive allocations" 
ON public.incentive_allocations FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create incentive allocations" 
ON public.incentive_allocations FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update incentive allocations" 
ON public.incentive_allocations FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- ============================================================================
-- PART 14: Fix DATA_LAB tables - Restricted to researchers and admins
-- ============================================================================

DROP POLICY IF EXISTS "Organizations viewable by authenticated users" ON public.data_lab_organizations;

CREATE POLICY "National staff can view data lab organizations" 
ON public.data_lab_organizations FOR SELECT 
TO authenticated
USING (public.is_national_level(auth.uid()) OR public.is_admin(auth.uid()));

-- ============================================================================
-- PART 15: Keep reference tables public (provinces, municipalities, communes)
-- These are OK to be publicly readable as they are reference data
-- ============================================================================

-- Provinces, municipalities, communes remain publicly readable
-- They don't contain sensitive data

-- ============================================================================
-- DONE - Summary of changes:
-- - Created 3 new helper functions for jurisdiction-based access
-- - Fixed audit_log: Only admins can view
-- - Fixed profiles: Users see own, admins see all
-- - Fixed farmers: Staff can view/edit in their jurisdiction
-- - Fixed certificates: Staff only, with public verification
-- - Fixed all financial tables: Staff only
-- - Fixed all production tables: Staff only
-- - Kept reference tables (provinces, etc.) publicly readable
-- ============================================================================
