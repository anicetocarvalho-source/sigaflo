-- Bucket público para fotos de árvores florestais (apoio à identificação e fiscalização)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tree-photos', 'tree-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública (fotos servem para fiscalização e verificação via QR)
CREATE POLICY "Public read tree photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'tree-photos');

-- Upload restrito a técnicos/admins
CREATE POLICY "Staff upload tree photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tree-photos'
  AND public.is_technician_or_admin(auth.uid())
);

-- Atualização restrita a técnicos/admins
CREATE POLICY "Staff update tree photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'tree-photos'
  AND public.is_technician_or_admin(auth.uid())
);

-- Remoção restrita a técnicos/admins
CREATE POLICY "Staff delete tree photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'tree-photos'
  AND public.is_technician_or_admin(auth.uid())
);