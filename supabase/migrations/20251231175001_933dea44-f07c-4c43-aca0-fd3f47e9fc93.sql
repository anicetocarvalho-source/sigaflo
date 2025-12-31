-- Add columns for photo, fingerprint and documents to farmers table
ALTER TABLE public.farmers 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS fingerprint_data TEXT,
ADD COLUMN IF NOT EXISTS document_bi_url TEXT,
ADD COLUMN IF NOT EXISTS document_other_url TEXT,
ADD COLUMN IF NOT EXISTS card_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS card_number TEXT,
ADD COLUMN IF NOT EXISTS card_qr_code TEXT;

-- Create storage bucket for farmer documents if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'farmer-documents', 
  'farmer-documents', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for farmer documents
CREATE POLICY "Anyone can view farmer documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'farmer-documents');

CREATE POLICY "Authenticated users can upload farmer documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'farmer-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update farmer documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'farmer-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete farmer documents" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'farmer-documents' AND auth.role() = 'authenticated');