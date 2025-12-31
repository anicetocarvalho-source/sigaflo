-- Add columns for company/large producer documents
ALTER TABLE public.farmers
ADD COLUMN IF NOT EXISTS document_license_url TEXT,
ADD COLUMN IF NOT EXISTS document_nif_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.farmers.document_license_url IS 'URL for company commercial license/alvará document';
COMMENT ON COLUMN public.farmers.document_nif_url IS 'URL for company NIF certificate document';