INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  -- Property images — publicly viewable
  (
    'properties',
    'properties',
    true,
    20971520, -- 20 MB per file
    ARRAY[
      'image/jpeg', 'image/jpg', 'image/png',
      'image/webp', 'image/gif'
    ]
  ),
 
  -- Proof of ownership documents — private (signed URLs only)
  (
    'proof-of-ownership',
    'proof-of-ownership',
    false,
    10485760, -- 10 MB per file
    ARRAY[
      'image/jpeg', 'image/jpg', 'image/png',
      'image/webp', 'application/pdf'
    ]
  ),
  -- verification documents — private (signed URLs only)
  (
    'verification-documents',
    'verification-documents',
    false,
    10485760, -- 10 MB per file
    ARRAY[
      'image/jpeg', 'image/jpg', 'image/png',
      'image/webp', 'application/pdf'
    ]
  ),
  -- avatar — private (signed URLs only)
  (
    'avatars',
    'avatars',
    false,
    10485760, -- 10 MB per file
    ARRAY[
      'image/jpeg', 'image/jpg', 'image/png',
      'image/webp', 'application/pdf'
    ]
  );


  CREATE POLICY "owner_can_read_documnets"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'verification-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- Owner can upload their own proof documents
CREATE POLICY "owner_can_insert_documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'verification-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can replace their own proof documents
CREATE POLICY "owner_can_update_documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'verification-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can delete their own proof documents
CREATE POLICY "owner_can_delete_documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'verification-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

  CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- User can upload their own avatar
CREATE POLICY "avatars_owner_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- User can replace their own avatar
CREATE POLICY "avatars_owner_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- User can delete their own avatar
CREATE POLICY "avatars_owner_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

  CREATE POLICY "owner_can_read_proof"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'proof-of-ownership'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- Owner can upload their own proof documents
CREATE POLICY "owner_can_insert_proof"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'proof-of-ownership'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can replace their own proof documents
CREATE POLICY "owner_can_update_proof"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'proof-of-ownership'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owner can delete their own proof documents
CREATE POLICY "owner_can_delete_proof"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'proof-of-ownership'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


  CREATE POLICY "properties_public_read"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'properties' );

CREATE POLICY "properties_landlord_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'properties'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "properties_landlord_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'properties'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "properties_landlord_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'properties'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );