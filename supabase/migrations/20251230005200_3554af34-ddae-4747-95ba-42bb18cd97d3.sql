
-- Corrigir search_path nas funções
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_registration_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    prefix TEXT;
    seq_num INTEGER;
BEGIN
    prefix := CASE NEW.farmer_type
        WHEN 'individual' THEN 'AGR'
        WHEN 'family' THEN 'FAM'
        WHEN 'cooperative' THEN 'COOP'
        WHEN 'field_school' THEN 'ECA'
        WHEN 'company' THEN 'EMP'
    END;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(registration_number FROM 5) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.farmers
    WHERE registration_number LIKE prefix || '-%';
    
    NEW.registration_number := prefix || '-' || LPAD(seq_num::TEXT, 6, '0');
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    prefix TEXT;
    seq_num INTEGER;
BEGIN
    prefix := 'CERT-' || NEW.year || '-';
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_number FROM LENGTH(prefix) + 1) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.agricultural_certificates
    WHERE certificate_number LIKE prefix || '%';
    
    NEW.certificate_number := prefix || LPAD(seq_num::TEXT, 6, '0');
    RETURN NEW;
END;
$$;
