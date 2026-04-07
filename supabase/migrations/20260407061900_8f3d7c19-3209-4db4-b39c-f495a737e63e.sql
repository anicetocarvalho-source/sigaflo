
CREATE OR REPLACE VIEW public.public_agriculture_stats AS
SELECT
  (SELECT count(*) FROM public.farmers) AS total_farmers,
  (SELECT count(*) FROM public.farmers WHERE farmer_type = 'individual') AS individual_farmers,
  (SELECT count(*) FROM public.farmers WHERE farmer_type = 'family') AS family_farmers,
  (SELECT count(*) FROM public.farmers WHERE farmer_type = 'cooperative') AS cooperative_count,
  (SELECT count(*) FROM public.farmers WHERE farmer_type = 'field_school') AS field_school_count,
  (SELECT count(*) FROM public.farmers WHERE farmer_type = 'company') AS company_count,
  (SELECT count(*) FROM public.farmers WHERE status = 'approved') AS approved_farmers,
  (SELECT COALESCE(SUM(area_planted_ha), 0) FROM public.production_history) AS total_cultivated_ha,
  (SELECT COALESCE(SUM(actual_yield_kg), 0) FROM public.production_history) AS total_production_kg,
  (SELECT count(*) FROM public.agricultural_certificates WHERE status = 'approved') AS certificates_issued,
  (SELECT count(DISTINCT province_id) FROM public.farmers WHERE province_id IS NOT NULL) AS provinces_with_farmers;

CREATE OR REPLACE VIEW public.public_agriculture_by_province AS
SELECT 
  p.name AS province_name,
  count(f.id) AS farmer_count,
  count(f.id) FILTER (WHERE f.status = 'approved') AS approved_count
FROM public.provinces p
LEFT JOIN public.farmers f ON f.province_id = p.id
GROUP BY p.id, p.name
ORDER BY farmer_count DESC;

CREATE OR REPLACE VIEW public.public_forestry_stats AS
SELECT
  (SELECT count(*) FROM public.forest_licenses WHERE status = 'active') AS active_licenses,
  (SELECT count(*) FROM public.forest_licenses) AS total_licenses,
  (SELECT count(*) FROM public.forest_reforestation_programs) AS reforestation_programs,
  (SELECT COALESCE(SUM(target_area_ha), 0) FROM public.forest_reforestation_programs) AS target_reforestation_ha,
  (SELECT COALESCE(SUM(planted_area_ha), 0) FROM public.forest_reforestation_programs) AS planted_area_ha,
  (SELECT COALESCE(SUM(target_seedlings), 0) FROM public.forest_reforestation_programs) AS target_seedlings,
  (SELECT COALESCE(SUM(planted_seedlings), 0) FROM public.forest_reforestation_programs) AS planted_seedlings,
  (SELECT count(*) FROM public.forest_infractions) AS total_infractions,
  (SELECT count(*) FROM public.forest_complaints) AS total_complaints,
  (SELECT count(*) FROM public.forest_trees) AS total_trees_registered;

CREATE OR REPLACE VIEW public.public_coffee_stats AS
SELECT
  (SELECT count(*) FROM public.coffee_lots) AS total_lots,
  (SELECT count(*) FROM public.coffee_lots WHERE status = 'registered') AS registered_lots,
  (SELECT count(*) FROM public.coffee_lots WHERE status = 'in_transit') AS in_transit_lots,
  (SELECT count(*) FROM public.coffee_lots WHERE status = 'exported') AS exported_lots,
  (SELECT COALESCE(SUM(volume_kg), 0) FROM public.coffee_lots) AS total_volume_kg,
  (SELECT COALESCE(SUM(bags_count), 0) FROM public.coffee_lots) AS total_bags,
  (SELECT count(*) FROM public.coffee_lots WHERE quality_grade = 'premium') AS premium_lots,
  (SELECT count(*) FROM public.coffee_lots WHERE quality_grade = 'standard') AS standard_lots,
  (SELECT count(DISTINCT variety) FROM public.coffee_lots WHERE variety IS NOT NULL) AS varieties_count;

CREATE OR REPLACE VIEW public.public_rice_stats AS
SELECT
  (SELECT count(*) FROM public.rice_production) AS production_records,
  (SELECT COALESCE(SUM(production_tonnes), 0) FROM public.rice_production) AS total_production_tonnes,
  (SELECT COALESCE(SUM(cultivated_area_ha), 0) FROM public.rice_production) AS total_area_ha,
  (SELECT count(*) FROM public.rice_imports) AS import_records,
  (SELECT COALESCE(SUM(volume_tonnes), 0) FROM public.rice_imports) AS total_imports_tonnes,
  (SELECT COALESCE(AVG(retail_price_aoa), 0) FROM public.rice_prices WHERE recorded_date > now() - interval '90 days') AS avg_retail_price_aoa;

CREATE OR REPLACE VIEW public.public_climate_alerts AS
SELECT 
  co.title,
  co.occurrence_type,
  co.severity,
  p.name AS province_name,
  co.report_date,
  co.affected_area_ha,
  co.affected_farmers_count
FROM public.climate_occurrences co
LEFT JOIN public.provinces p ON p.id = co.province_id
WHERE co.severity IN ('critical', 'high')
  AND co.status != 'resolved'
  AND co.report_date > now() - interval '90 days'
ORDER BY co.report_date DESC
LIMIT 20;

GRANT SELECT ON public.public_agriculture_stats TO anon;
GRANT SELECT ON public.public_agriculture_by_province TO anon;
GRANT SELECT ON public.public_forestry_stats TO anon;
GRANT SELECT ON public.public_coffee_stats TO anon;
GRANT SELECT ON public.public_rice_stats TO anon;
GRANT SELECT ON public.public_climate_alerts TO anon;
