
-- ============================================================================
-- SIGAF SECURITY FIX: Part 3 - Clean up duplicate policies and fix function
-- ============================================================================

-- ============================================================================
-- PART 1: Remove duplicate/old policies that still exist
-- ============================================================================

-- FOREST_NURSERIES - remove old public policy
DROP POLICY IF EXISTS "Nurseries viewable by everyone" ON public.forest_nurseries;

-- FOREST_REFORESTATION_ACTIVITIES - remove old public policy
DROP POLICY IF EXISTS "Reforestation activities viewable by everyone" ON public.forest_reforestation_activities;

-- FOREST_REFORESTATION_PROGRAMS - remove old public policy
DROP POLICY IF EXISTS "Reforestation programs viewable by everyone" ON public.forest_reforestation_programs;

-- FOREST_SEEDLING_STOCK - remove old public policy
DROP POLICY IF EXISTS "Seedling stock viewable by everyone" ON public.forest_seedling_stock;

-- FOREST_INVENTORY - remove old permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert forest inventory" ON public.forest_inventory;
DROP POLICY IF EXISTS "Authenticated users can update forest inventory" ON public.forest_inventory;

-- PRODUCTION_HISTORY - remove old permissive policies
DROP POLICY IF EXISTS "Authenticated can insert production" ON public.production_history;
DROP POLICY IF EXISTS "Authenticated can update production" ON public.production_history;

-- PRODUCTION_HISTORY_CERTIFICATES - remove old permissive policies
DROP POLICY IF EXISTS "Allow authenticated read access to production certificates" ON public.production_history_certificates;
DROP POLICY IF EXISTS "Allow authenticated insert to production certificates" ON public.production_history_certificates;
DROP POLICY IF EXISTS "Allow authenticated update to production certificates" ON public.production_history_certificates;

-- INSTITUTIONAL_ACCESS_LOGS - remove old permissive policies
DROP POLICY IF EXISTS "Allow authenticated read access to access logs" ON public.institutional_access_logs;
DROP POLICY IF EXISTS "Allow authenticated insert to access logs" ON public.institutional_access_logs;

-- ============================================================================
-- PART 2: Fix DATA_LAB system tables - these need authenticated INSERT for system use
-- ============================================================================

-- DATA_LAB_AUDIT_LOG
DROP POLICY IF EXISTS "System can insert audit entries" ON public.data_lab_audit_log;

CREATE POLICY "National staff can insert audit entries" 
ON public.data_lab_audit_log FOR INSERT 
TO authenticated
WITH CHECK (public.is_national_level(auth.uid()) OR public.is_admin(auth.uid()));

-- DATA_LAB_EXPORTS
DROP POLICY IF EXISTS "System can create exports" ON public.data_lab_exports;

CREATE POLICY "National staff can create exports" 
ON public.data_lab_exports FOR INSERT 
TO authenticated
WITH CHECK (public.is_national_level(auth.uid()) OR public.is_admin(auth.uid()));

-- DATA_LAB_QUERY_HISTORY
DROP POLICY IF EXISTS "System can insert history" ON public.data_lab_query_history;

CREATE POLICY "National staff can insert history" 
ON public.data_lab_query_history FOR INSERT 
TO authenticated
WITH CHECK (public.is_national_level(auth.uid()) OR public.is_admin(auth.uid()));

-- ============================================================================
-- PART 3: Fix the function without search_path (update_province_risk_metrics)
-- The only function flagged is update_province_risk_metrics - it already has search_path
-- But there might be others, let's check and fix calculate_risk_score
-- ============================================================================

-- Fix calculate_risk_score function to have proper search_path
CREATE OR REPLACE FUNCTION public.calculate_risk_score(
  p_critical integer, 
  p_high integer, 
  p_medium integer, 
  p_low integer, 
  p_affected_area numeric, 
  p_affected_farmers integer
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER
SET search_path = public
AS $function$
BEGIN
  RETURN (
    (COALESCE(p_critical, 0) * 100) +
    (COALESCE(p_high, 0) * 50) +
    (COALESCE(p_medium, 0) * 20) +
    (COALESCE(p_low, 0) * 5) +
    (COALESCE(p_affected_area, 0) * 0.1) +
    (COALESCE(p_affected_farmers, 0) * 2)
  );
END;
$function$;

-- ============================================================================
-- DONE - Cleaned up duplicate policies and fixed function search_path
-- ============================================================================
