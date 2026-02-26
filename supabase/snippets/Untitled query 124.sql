create policy "Users can access their own folder"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'verification-documents'
  AND (storage.foldername(name))[1] = 'id_' || auth.uid()::text
);