
CREATE OR REPLACE VIEW public.public_farmer_registry
WITH (security_invoker = on) AS
SELECT
  f.registration_number,
  f.name,
  f.farmer_type,
  p.name AS province_name,
  m.name AS municipality_name,
  f.status::text AS status,
  f.created_at AS registration_date
FROM public.farmers f
LEFT JOIN public.provinces p ON f.province_id = p.id
LEFT JOIN public.municipalities m ON f.municipality_id = m.id
WHERE f.status = 'approved'::workflow_status;

GRANT SELECT ON public.public_farmer_registry TO anon;

CREATE OR REPLACE VIEW public.public_indicators_by_year
WITH (security_invoker = on) AS
SELECT
  ph.year,
  ph.crop_type,
  COUNT(*) AS num_records,
  SUM(ph.area_planted_ha) AS total_area_ha,
  SUM(ph.actual_yield_kg) AS total_quantity_kg,
  CASE WHEN SUM(ph.area_planted_ha) > 0 THEN SUM(ph.actual_yield_kg) / SUM(ph.area_planted_ha) ELSE 0 END AS productivity_kg_ha,
  p.name AS province_name
FROM public.production_history ph
LEFT JOIN public.farmers f ON ph.farmer_id = f.id
LEFT JOIN public.provinces p ON f.province_id = p.id
GROUP BY ph.year, ph.crop_type, p.name;

GRANT SELECT ON public.public_indicators_by_year TO anon;
