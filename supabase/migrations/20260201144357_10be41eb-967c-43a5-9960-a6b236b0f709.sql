
-- ============================================================================
-- SIGAF SECURITY FIX: Part 2 - Remaining RLS Policies
-- Fix forest tables, complaints, alerts, and other remaining permissive policies
-- ============================================================================

-- ============================================================================
-- PART 1: Fix FOREST tables
-- ============================================================================

-- FOREST_OPERATORS
DROP POLICY IF EXISTS "Forest operators viewable by authenticated" ON public.forest_operators;
DROP POLICY IF EXISTS "Forest operators insertable by authenticated" ON public.forest_operators;
DROP POLICY IF EXISTS "Forest operators updatable by authenticated" ON public.forest_operators;

CREATE POLICY "Staff can view forest operators" 
ON public.forest_operators FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create forest operators" 
ON public.forest_operators FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update forest operators" 
ON public.forest_operators FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- FOREST_INVENTORY
DROP POLICY IF EXISTS "Authenticated users can view forest inventory" ON public.forest_inventory;
DROP POLICY IF EXISTS "Authenticated users can manage forest inventory" ON public.forest_inventory;

CREATE POLICY "Staff can view forest inventory" 
ON public.forest_inventory FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can manage forest inventory" 
ON public.forest_inventory FOR ALL 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()))
WITH CHECK (public.is_technician_or_admin(auth.uid()));

-- FOREST_TREES
DROP POLICY IF EXISTS "Forest trees viewable by authenticated" ON public.forest_trees;
DROP POLICY IF EXISTS "Forest trees insertable by authenticated" ON public.forest_trees;
DROP POLICY IF EXISTS "Forest trees updatable by authenticated" ON public.forest_trees;

CREATE POLICY "Staff can view forest trees" 
ON public.forest_trees FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create forest trees" 
ON public.forest_trees FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update forest trees" 
ON public.forest_trees FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- FOREST_LOGS
DROP POLICY IF EXISTS "Forest logs viewable by authenticated" ON public.forest_logs;
DROP POLICY IF EXISTS "Forest logs insertable by authenticated" ON public.forest_logs;
DROP POLICY IF EXISTS "Forest logs updatable by authenticated" ON public.forest_logs;

CREATE POLICY "Staff can view forest logs" 
ON public.forest_logs FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- Public can verify log by QR code
CREATE POLICY "Public can verify logs" 
ON public.forest_logs FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Staff can create forest logs" 
ON public.forest_logs FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update forest logs" 
ON public.forest_logs FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- FOREST_TRANSPORT_PERMITS
DROP POLICY IF EXISTS "Forest permits viewable by authenticated" ON public.forest_transport_permits;
DROP POLICY IF EXISTS "Forest permits insertable by authenticated" ON public.forest_transport_permits;
DROP POLICY IF EXISTS "Forest permits updatable by authenticated" ON public.forest_transport_permits;

CREATE POLICY "Staff can view transport permits" 
ON public.forest_transport_permits FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Public can verify transport permits" 
ON public.forest_transport_permits FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Staff can create transport permits" 
ON public.forest_transport_permits FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update transport permits" 
ON public.forest_transport_permits FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- FOREST_COMPLAINTS - Keep public for anonymous reporting
DROP POLICY IF EXISTS "Complaints insertable by anyone" ON public.forest_complaints;
DROP POLICY IF EXISTS "Complaints viewable by authenticated" ON public.forest_complaints;
DROP POLICY IF EXISTS "Complaints updatable by authenticated" ON public.forest_complaints;

CREATE POLICY "Anyone can submit complaints" 
ON public.forest_complaints FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Staff can view complaints" 
ON public.forest_complaints FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update complaints" 
ON public.forest_complaints FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- FOREST_INFRACTIONS
DROP POLICY IF EXISTS "Infractions viewable by authenticated" ON public.forest_infractions;
DROP POLICY IF EXISTS "Infractions insertable by authenticated" ON public.forest_infractions;
DROP POLICY IF EXISTS "Infractions updatable by authenticated" ON public.forest_infractions;

CREATE POLICY "Staff can view infractions" 
ON public.forest_infractions FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create infractions" 
ON public.forest_infractions FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update infractions" 
ON public.forest_infractions FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- FOREST_CHECKPOINTS
DROP POLICY IF EXISTS "Checkpoints viewable by everyone" ON public.forest_checkpoints;
DROP POLICY IF EXISTS "Checkpoints insertable by authenticated" ON public.forest_checkpoints;
DROP POLICY IF EXISTS "Checkpoints updatable by authenticated" ON public.forest_checkpoints;

CREATE POLICY "Staff can view checkpoints" 
ON public.forest_checkpoints FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create checkpoints" 
ON public.forest_checkpoints FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update checkpoints" 
ON public.forest_checkpoints FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- FOREST_CHECKPOINT_LOGS
DROP POLICY IF EXISTS "Checkpoint logs viewable by everyone" ON public.forest_checkpoint_logs;
DROP POLICY IF EXISTS "Checkpoint logs insertable by authenticated" ON public.forest_checkpoint_logs;

CREATE POLICY "Staff can view checkpoint logs" 
ON public.forest_checkpoint_logs FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create checkpoint logs" 
ON public.forest_checkpoint_logs FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

-- FOREST_REFORESTATION_PROGRAMS
DROP POLICY IF EXISTS "Reforestation programs viewable by authenticated" ON public.forest_reforestation_programs;
DROP POLICY IF EXISTS "Reforestation programs insertable by authenticated" ON public.forest_reforestation_programs;
DROP POLICY IF EXISTS "Reforestation programs updatable by authenticated" ON public.forest_reforestation_programs;

CREATE POLICY "Staff can view reforestation programs" 
ON public.forest_reforestation_programs FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create reforestation programs" 
ON public.forest_reforestation_programs FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update reforestation programs" 
ON public.forest_reforestation_programs FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- FOREST_REFORESTATION_ACTIVITIES
DROP POLICY IF EXISTS "Reforestation activities viewable by authenticated" ON public.forest_reforestation_activities;
DROP POLICY IF EXISTS "Reforestation activities insertable by authenticated" ON public.forest_reforestation_activities;
DROP POLICY IF EXISTS "Reforestation activities updatable by authenticated" ON public.forest_reforestation_activities;

CREATE POLICY "Staff can view reforestation activities" 
ON public.forest_reforestation_activities FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create reforestation activities" 
ON public.forest_reforestation_activities FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update reforestation activities" 
ON public.forest_reforestation_activities FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- FOREST_NURSERIES
DROP POLICY IF EXISTS "Nurseries viewable by authenticated" ON public.forest_nurseries;
DROP POLICY IF EXISTS "Nurseries insertable by authenticated" ON public.forest_nurseries;
DROP POLICY IF EXISTS "Nurseries updatable by authenticated" ON public.forest_nurseries;

CREATE POLICY "Staff can view nurseries" 
ON public.forest_nurseries FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create nurseries" 
ON public.forest_nurseries FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update nurseries" 
ON public.forest_nurseries FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- FOREST_SEEDLING_STOCK
DROP POLICY IF EXISTS "Seedling stock viewable by authenticated" ON public.forest_seedling_stock;
DROP POLICY IF EXISTS "Seedling stock insertable by authenticated" ON public.forest_seedling_stock;
DROP POLICY IF EXISTS "Seedling stock updatable by authenticated" ON public.forest_seedling_stock;

CREATE POLICY "Staff can view seedling stock" 
ON public.forest_seedling_stock FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create seedling stock" 
ON public.forest_seedling_stock FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update seedling stock" 
ON public.forest_seedling_stock FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- ============================================================================
-- PART 2: Fix ALERT tables
-- ============================================================================

-- CREDIT_INSURANCE_ALERTS
DROP POLICY IF EXISTS "Allow authenticated read access to alerts" ON public.credit_insurance_alerts;
DROP POLICY IF EXISTS "Allow authenticated insert to alerts" ON public.credit_insurance_alerts;
DROP POLICY IF EXISTS "Allow authenticated update to alerts" ON public.credit_insurance_alerts;
DROP POLICY IF EXISTS "Allow authenticated delete from alerts" ON public.credit_insurance_alerts;

CREATE POLICY "Staff can view credit alerts" 
ON public.credit_insurance_alerts FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create credit alerts" 
ON public.credit_insurance_alerts FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update credit alerts" 
ON public.credit_insurance_alerts FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can delete credit alerts" 
ON public.credit_insurance_alerts FOR DELETE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- INCENTIVE_ALERTS
DROP POLICY IF EXISTS "Incentive alerts viewable by authenticated" ON public.incentive_alerts;
DROP POLICY IF EXISTS "Incentive alerts insertable by authenticated" ON public.incentive_alerts;
DROP POLICY IF EXISTS "Incentive alerts updatable by authenticated" ON public.incentive_alerts;

CREATE POLICY "Staff can view incentive alerts" 
ON public.incentive_alerts FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create incentive alerts" 
ON public.incentive_alerts FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update incentive alerts" 
ON public.incentive_alerts FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- OCCURRENCE_ALERTS
DROP POLICY IF EXISTS "Occurrence alerts viewable by authenticated" ON public.occurrence_alerts;
DROP POLICY IF EXISTS "Occurrence alerts insertable by authenticated" ON public.occurrence_alerts;
DROP POLICY IF EXISTS "Occurrence alerts updatable by authenticated" ON public.occurrence_alerts;

CREATE POLICY "Staff can view occurrence alerts" 
ON public.occurrence_alerts FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create occurrence alerts" 
ON public.occurrence_alerts FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update occurrence alerts" 
ON public.occurrence_alerts FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- RICE_ALERTS
DROP POLICY IF EXISTS "Rice alerts viewable by authenticated" ON public.rice_alerts;
DROP POLICY IF EXISTS "Rice alerts insertable by authenticated" ON public.rice_alerts;
DROP POLICY IF EXISTS "Rice alerts updatable by authenticated" ON public.rice_alerts;

CREATE POLICY "Staff can view rice alerts" 
ON public.rice_alerts FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create rice alerts" 
ON public.rice_alerts FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update rice alerts" 
ON public.rice_alerts FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- ============================================================================
-- PART 3: Fix DATA_LAB tables
-- ============================================================================

-- DATA_LAB_DATASETS
DROP POLICY IF EXISTS "Datasets viewable by authenticated" ON public.data_lab_datasets;

CREATE POLICY "National staff can view datasets" 
ON public.data_lab_datasets FOR SELECT 
TO authenticated
USING (public.is_national_level(auth.uid()) OR public.is_admin(auth.uid()));

-- DATA_LAB_RESEARCHERS
DROP POLICY IF EXISTS "Researchers viewable by authenticated" ON public.data_lab_researchers;

CREATE POLICY "National staff can view researchers" 
ON public.data_lab_researchers FOR SELECT 
TO authenticated
USING (public.is_national_level(auth.uid()) OR public.is_admin(auth.uid()));

-- DATA_LAB_ACCESS_REQUESTS
DROP POLICY IF EXISTS "Access requests viewable by authenticated" ON public.data_lab_access_requests;

CREATE POLICY "National staff can view access requests" 
ON public.data_lab_access_requests FOR SELECT 
TO authenticated
USING (public.is_national_level(auth.uid()) OR public.is_admin(auth.uid()));

-- ============================================================================
-- PART 4: Fix remaining tables with permissive policies
-- ============================================================================

-- FARMER_DATA_CONSENTS
DROP POLICY IF EXISTS "Allow authenticated read access to consents" ON public.farmer_data_consents;
DROP POLICY IF EXISTS "Allow authenticated insert to consents" ON public.farmer_data_consents;
DROP POLICY IF EXISTS "Allow authenticated update to consents" ON public.farmer_data_consents;
DROP POLICY IF EXISTS "Allow authenticated delete from consents" ON public.farmer_data_consents;

CREATE POLICY "Staff can view consents" 
ON public.farmer_data_consents FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create consents" 
ON public.farmer_data_consents FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update consents" 
ON public.farmer_data_consents FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can delete consents" 
ON public.farmer_data_consents FOR DELETE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- INSTITUTIONAL_ACCESS_LOGS
DROP POLICY IF EXISTS "Access logs viewable by authenticated" ON public.institutional_access_logs;
DROP POLICY IF EXISTS "Access logs insertable by authenticated" ON public.institutional_access_logs;

CREATE POLICY "Admins can view institutional access logs" 
ON public.institutional_access_logs FOR SELECT 
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "System can log institutional access" 
ON public.institutional_access_logs FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

-- ELIGIBILITY_RULES
DROP POLICY IF EXISTS "Eligibility rules viewable by authenticated" ON public.eligibility_rules;
DROP POLICY IF EXISTS "Eligibility rules insertable by authenticated" ON public.eligibility_rules;
DROP POLICY IF EXISTS "Eligibility rules updatable by authenticated" ON public.eligibility_rules;

CREATE POLICY "Staff can view eligibility rules" 
ON public.eligibility_rules FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Admin can create eligibility rules" 
ON public.eligibility_rules FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin can update eligibility rules" 
ON public.eligibility_rules FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- OCCURRENCE_SURVEYS
DROP POLICY IF EXISTS "Surveys viewable by authenticated" ON public.occurrence_surveys;
DROP POLICY IF EXISTS "Surveys insertable by authenticated" ON public.occurrence_surveys;
DROP POLICY IF EXISTS "Surveys updatable by authenticated" ON public.occurrence_surveys;

CREATE POLICY "Staff can view surveys" 
ON public.occurrence_surveys FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create surveys" 
ON public.occurrence_surveys FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update surveys" 
ON public.occurrence_surveys FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- PRODUCTION_HISTORY_CERTIFICATES
DROP POLICY IF EXISTS "Production history certificates viewable by authenticated" ON public.production_history_certificates;
DROP POLICY IF EXISTS "Production history certificates insertable by authenticated" ON public.production_history_certificates;
DROP POLICY IF EXISTS "Production history certificates updatable by authenticated" ON public.production_history_certificates;

CREATE POLICY "Staff can view production certificates" 
ON public.production_history_certificates FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create production certificates" 
ON public.production_history_certificates FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update production certificates" 
ON public.production_history_certificates FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- RICE_CONSUMPTION
DROP POLICY IF EXISTS "Rice consumption viewable by authenticated" ON public.rice_consumption;
DROP POLICY IF EXISTS "Rice consumption insertable by authenticated" ON public.rice_consumption;
DROP POLICY IF EXISTS "Rice consumption updatable by authenticated" ON public.rice_consumption;

CREATE POLICY "Staff can view rice consumption" 
ON public.rice_consumption FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create rice consumption" 
ON public.rice_consumption FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update rice consumption" 
ON public.rice_consumption FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- RICE_PARAMETERS
DROP POLICY IF EXISTS "Rice parameters viewable by authenticated" ON public.rice_parameters;
DROP POLICY IF EXISTS "Rice parameters insertable by authenticated" ON public.rice_parameters;
DROP POLICY IF EXISTS "Rice parameters updatable by authenticated" ON public.rice_parameters;

CREATE POLICY "Staff can view rice parameters" 
ON public.rice_parameters FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Admin can manage rice parameters" 
ON public.rice_parameters FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- INCENTIVE_IMPACTS
DROP POLICY IF EXISTS "Incentive impacts viewable by authenticated" ON public.incentive_impacts;
DROP POLICY IF EXISTS "Incentive impacts insertable by authenticated" ON public.incentive_impacts;
DROP POLICY IF EXISTS "Incentive impacts updatable by authenticated" ON public.incentive_impacts;

CREATE POLICY "Staff can view incentive impacts" 
ON public.incentive_impacts FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can create incentive impacts" 
ON public.incentive_impacts FOR INSERT 
TO authenticated
WITH CHECK (public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Staff can update incentive impacts" 
ON public.incentive_impacts FOR UPDATE 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- PROVINCE_RISK_METRICS
DROP POLICY IF EXISTS "Province risk metrics viewable by authenticated" ON public.province_risk_metrics;

CREATE POLICY "Staff can view risk metrics" 
ON public.province_risk_metrics FOR SELECT 
TO authenticated
USING (public.is_technician_or_admin(auth.uid()));

-- ============================================================================
-- DONE - All remaining permissive policies have been fixed
-- ============================================================================
