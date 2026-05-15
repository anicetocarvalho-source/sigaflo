
ALTER TABLE public.forest_import_licenses
  ADD COLUMN IF NOT EXISTS proforma_invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS proforma_invoice_date DATE,
  ADD COLUMN IF NOT EXISTS requires_phytosanitary_cert BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS legal_reference TEXT DEFAULT 'RF. 153 do Decreto Presidencial nº 171/18 do Regulamento Florestal e Fauna Selvagem',
  ADD COLUMN IF NOT EXISTS issued_location TEXT DEFAULT 'LUANDA';
