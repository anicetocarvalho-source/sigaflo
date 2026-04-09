
-- Enums
DO $$ BEGIN
  CREATE TYPE public.invoice_status AS ENUM ('emitida','pendente','comunicada','aceite','rejeitada');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.invoice_series_type AS ENUM ('FE','FR','NC');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.pos_payment_method AS ENUM ('agropay','unitel_money','deferred');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.purchase_status AS ENUM ('pending','approved','rejected','completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1. pos_products
CREATE TABLE public.pos_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'geral',
  price_aoa NUMERIC(12,2) NOT NULL DEFAULT 0,
  iva_rate NUMERIC(5,2) NOT NULL DEFAULT 14.00,
  unit TEXT NOT NULL DEFAULT 'un',
  stock INTEGER NOT NULL DEFAULT 0,
  is_exempt BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pos_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read products" ON public.pos_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tech/admin can manage products" ON public.pos_products FOR ALL TO authenticated USING (public.is_technician_or_admin(auth.uid())) WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE TRIGGER update_pos_products_updated_at BEFORE UPDATE ON public.pos_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. farmer_wallets
CREATE TABLE public.farmer_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  balance_aoa NUMERIC(14,2) NOT NULL DEFAULT 0,
  pin_hash TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(farmer_id)
);
ALTER TABLE public.farmer_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tech/admin can manage wallets" ON public.farmer_wallets FOR ALL TO authenticated USING (public.is_technician_or_admin(auth.uid())) WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE TRIGGER update_farmer_wallets_updated_at BEFORE UPDATE ON public.farmer_wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. pos_sales
CREATE TABLE public.pos_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.farmers(id),
  operator_id UUID REFERENCES auth.users(id),
  subtotal_aoa NUMERIC(14,2) NOT NULL DEFAULT 0,
  iva_total_aoa NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_aoa NUMERIC(14,2) NOT NULL DEFAULT 0,
  payment_method public.pos_payment_method NOT NULL DEFAULT 'agropay',
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  representative_name TEXT,
  representative_bi TEXT,
  representative_relationship TEXT,
  hash_fiscal TEXT,
  hash_anterior TEXT,
  qr_data TEXT,
  is_offline BOOLEAN NOT NULL DEFAULT false,
  synced_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pos_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tech/admin can manage sales" ON public.pos_sales FOR ALL TO authenticated USING (public.is_technician_or_admin(auth.uid())) WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Viewers can read sales" ON public.pos_sales FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_pos_sales_updated_at BEFORE UPDATE ON public.pos_sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. pos_sale_items
CREATE TABLE public.pos_sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.pos_sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.pos_products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_aoa NUMERIC(12,2) NOT NULL DEFAULT 0,
  iva_rate NUMERIC(5,2) NOT NULL DEFAULT 14.00,
  iva_value_aoa NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal_aoa NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_exempt BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pos_sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tech/admin can manage sale items" ON public.pos_sale_items FOR ALL TO authenticated USING (public.is_technician_or_admin(auth.uid())) WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Viewers can read sale items" ON public.pos_sale_items FOR SELECT TO authenticated USING (true);

-- 5. invoice_series
CREATE TABLE public.invoice_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code public.invoice_series_type NOT NULL,
  prefix TEXT NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(code)
);
ALTER TABLE public.invoice_series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read series" ON public.invoice_series FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage series" ON public.invoice_series FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER update_invoice_series_updated_at BEFORE UPDATE ON public.invoice_series FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default series
INSERT INTO public.invoice_series (code, prefix) VALUES
  ('FE', 'FE'),
  ('FR', 'FR'),
  ('NC', 'NC');

-- 6. invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  series_code public.invoice_series_type NOT NULL DEFAULT 'FE',
  sale_id UUID REFERENCES public.pos_sales(id),
  farmer_id UUID REFERENCES public.farmers(id),
  operator_id UUID REFERENCES auth.users(id),
  subtotal_aoa NUMERIC(14,2) NOT NULL DEFAULT 0,
  iva_total_aoa NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_aoa NUMERIC(14,2) NOT NULL DEFAULT 0,
  status public.invoice_status NOT NULL DEFAULT 'emitida',
  hash_fiscal TEXT,
  hash_anterior TEXT,
  system_id TEXT NOT NULL DEFAULT 'AGROPY-POS-001',
  qr_data TEXT,
  xml_data TEXT,
  is_offline BOOLEAN NOT NULL DEFAULT false,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  communicated_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tech/admin can manage invoices" ON public.invoices FOR ALL TO authenticated USING (public.is_technician_or_admin(auth.uid())) WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Viewers can read invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_prefix TEXT;
  v_year TEXT;
  v_seq INTEGER;
BEGIN
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT prefix INTO v_prefix FROM public.invoice_series WHERE code = NEW.series_code;
  
  UPDATE public.invoice_series SET last_number = last_number + 1 WHERE code = NEW.series_code RETURNING last_number INTO v_seq;
  
  NEW.invoice_number := 'INV-' || v_prefix || '-' || v_year || '-' || LPAD(v_seq::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_invoice_number_trigger BEFORE INSERT ON public.invoices FOR EACH ROW WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '') EXECUTE FUNCTION public.generate_invoice_number();

-- 7. subsidized_purchases
CREATE TABLE public.subsidized_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.farmers(id),
  purchase_package_id UUID,
  supplier TEXT,
  product_name TEXT NOT NULL,
  product_id UUID REFERENCES public.pos_products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_value_aoa NUMERIC(14,2) NOT NULL DEFAULT 0,
  subsidy_value_aoa NUMERIC(14,2) NOT NULL DEFAULT 0,
  copayment_value_aoa NUMERIC(14,2) NOT NULL DEFAULT 0,
  subsidy_percentage NUMERIC(5,2) NOT NULL DEFAULT 70.00,
  status public.purchase_status NOT NULL DEFAULT 'pending',
  is_deferred BOOLEAN NOT NULL DEFAULT false,
  order_service_id TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subsidized_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tech/admin can manage purchases" ON public.subsidized_purchases FOR ALL TO authenticated USING (public.is_technician_or_admin(auth.uid())) WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Viewers can read purchases" ON public.subsidized_purchases FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_subsidized_purchases_updated_at BEFORE UPDATE ON public.subsidized_purchases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. purchase_packages
CREATE TABLE public.purchase_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmers(id),
  campaign TEXT NOT NULL,
  campaign_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  status TEXT NOT NULL DEFAULT 'active',
  province_id UUID REFERENCES public.provinces(id),
  municipality_id UUID REFERENCES public.municipalities(id),
  crop_type TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.purchase_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tech/admin can manage packages" ON public.purchase_packages FOR ALL TO authenticated USING (public.is_technician_or_admin(auth.uid())) WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Viewers can read packages" ON public.purchase_packages FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_purchase_packages_updated_at BEFORE UPDATE ON public.purchase_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. purchase_package_items
CREATE TABLE public.purchase_package_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.purchase_packages(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.pos_products(id),
  product_name TEXT NOT NULL,
  max_quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'un',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.purchase_package_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tech/admin can manage package items" ON public.purchase_package_items FOR ALL TO authenticated USING (public.is_technician_or_admin(auth.uid())) WITH CHECK (public.is_technician_or_admin(auth.uid()));
CREATE POLICY "Viewers can read package items" ON public.purchase_package_items FOR SELECT TO authenticated USING (true);

-- 10. payment_gateway_config
CREATE TABLE public.payment_gateway_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  display_name TEXT NOT NULL,
  config_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_sandbox BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider)
);
ALTER TABLE public.payment_gateway_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage gateway config" ON public.payment_gateway_config FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Tech can read gateway config" ON public.payment_gateway_config FOR SELECT TO authenticated USING (public.is_technician_or_admin(auth.uid()));
CREATE TRIGGER update_payment_gateway_config_updated_at BEFORE UPDATE ON public.payment_gateway_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default gateways
INSERT INTO public.payment_gateway_config (provider, display_name, config_data) VALUES
  ('unitel_money', 'Unitel Money', '{"shortCode":"","apiKey":"","callbackUrl":"","environment":"sandbox"}'),
  ('card', 'Cartão Bancário', '{"merchantId":"","apiKey":"","provider":"","currencies":["AOA"]}');

-- Add FK from subsidized_purchases to purchase_packages
ALTER TABLE public.subsidized_purchases ADD CONSTRAINT subsidized_purchases_package_fk FOREIGN KEY (purchase_package_id) REFERENCES public.purchase_packages(id);
