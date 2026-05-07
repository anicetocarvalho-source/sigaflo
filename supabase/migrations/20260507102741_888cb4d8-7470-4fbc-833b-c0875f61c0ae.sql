-- Make license-documents bucket private and tighten access
UPDATE storage.buckets SET public = false WHERE id = 'license-documents';

-- Drop the broad public-read policy
DROP POLICY IF EXISTS license_docs_public_read ON storage.objects;

-- Authenticated users (technicians/admins) can read
CREATE POLICY license_docs_authenticated_read
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'license-documents'
    AND public.is_technician_or_admin(auth.uid())
  );

-- Allow admins/technicians to update and delete their bucket files
DROP POLICY IF EXISTS license_docs_admin_update ON storage.objects;
CREATE POLICY license_docs_admin_update
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'license-documents' AND public.is_technician_or_admin(auth.uid()))
  WITH CHECK (bucket_id = 'license-documents' AND public.is_technician_or_admin(auth.uid()));

DROP POLICY IF EXISTS license_docs_admin_delete ON storage.objects;
CREATE POLICY license_docs_admin_delete
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'license-documents' AND public.is_technician_or_admin(auth.uid()));