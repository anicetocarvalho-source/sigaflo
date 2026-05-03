
-- Audit trigger function for cooperative_details and field_school_details
CREATE OR REPLACE FUNCTION public.audit_entity_details()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entity_id UUID;
  v_action TEXT;
  v_old JSONB;
  v_new JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_entity_id := NEW.farmer_id;
    v_action := 'create';
    v_old := NULL;
    v_new := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_entity_id := NEW.farmer_id;
    v_action := 'update';
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    v_entity_id := OLD.farmer_id;
    v_action := 'delete';
    v_old := to_jsonb(OLD);
    v_new := NULL;
  END IF;

  INSERT INTO public.audit_log (entity_type, entity_id, action, old_values, new_values, user_id)
  VALUES (TG_TABLE_NAME, v_entity_id, v_action, v_old, v_new, auth.uid());

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers
DROP TRIGGER IF EXISTS audit_cooperative_details ON public.cooperative_details;
CREATE TRIGGER audit_cooperative_details
  AFTER INSERT OR UPDATE OR DELETE ON public.cooperative_details
  FOR EACH ROW EXECUTE FUNCTION public.audit_entity_details();

DROP TRIGGER IF EXISTS audit_field_school_details ON public.field_school_details;
CREATE TRIGGER audit_field_school_details
  AFTER INSERT OR UPDATE OR DELETE ON public.field_school_details
  FOR EACH ROW EXECUTE FUNCTION public.audit_entity_details();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_cooperative_details_nif ON public.cooperative_details(nif);
CREATE INDEX IF NOT EXISTS idx_field_school_details_focus_crop ON public.field_school_details(focus_crop);
CREATE INDEX IF NOT EXISTS idx_field_school_details_start_date ON public.field_school_details(start_date);
