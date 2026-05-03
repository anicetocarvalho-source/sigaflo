-- Create public bucket for farmer profile photos (used on profile, FarmerCard and printed PVC cards)
INSERT INTO storage.buckets (id, name, public)
VALUES ('farmer-photos', 'farmer-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read (photos appear on identification cards / QR verification)
CREATE POLICY "Farmer photos are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'farmer-photos');

-- Only technicians/admins can upload/update/delete
CREATE POLICY "Technicians can upload farmer photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'farmer-photos' AND public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Technicians can update farmer photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'farmer-photos' AND public.is_technician_or_admin(auth.uid()));

CREATE POLICY "Technicians can delete farmer photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'farmer-photos' AND public.is_technician_or_admin(auth.uid()));