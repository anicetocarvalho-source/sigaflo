
-- Fix generate_alert_number to extract seq after last dash
CREATE OR REPLACE FUNCTION public.generate_alert_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
  v_prefix TEXT;
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  v_prefix := 'ALR-' || v_year || '-';
  SELECT COALESCE(MAX(CAST(SUBSTRING(alert_number FROM LENGTH(v_prefix) + 1) AS INTEGER)), 0) + 1
    INTO v_seq
    FROM public.monitoring_alerts
    WHERE alert_number LIKE v_prefix || '%';
  NEW.alert_number := v_prefix || LPAD(v_seq::TEXT, 6, '0');
  RETURN NEW;
END;
$function$;

-- Fix generate_order_number to extract seq after last dash
CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_year TEXT;
  v_seq INTEGER;
  v_prefix TEXT;
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  v_prefix := 'OSM-' || v_year || '-';
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM LENGTH(v_prefix) + 1) AS INTEGER)), 0) + 1
    INTO v_seq
    FROM public.service_orders
    WHERE order_number LIKE v_prefix || '%';
  NEW.order_number := v_prefix || LPAD(v_seq::TEXT, 6, '0');
  RETURN NEW;
END;
$function$;
