-- D1: Add UNIQUE constraint on bi_nif to prevent duplicate farmer registrations
ALTER TABLE public.farmers ADD CONSTRAINT farmers_bi_nif_unique UNIQUE (bi_nif);

-- S2: Make farmer-documents bucket private
UPDATE storage.buckets SET public = false WHERE id = 'farmer-documents';