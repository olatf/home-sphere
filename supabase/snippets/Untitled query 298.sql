-- Admin full access
create policy "Admin full access"
on storage.objects
for all
using (
  public.is_admin()
);


-- Users can upload only to their own folder
create policy "Users can upload their own verification docs"
on storage.objects
for insert
with check (
  auth.uid() is not null
  and bucket_id = 'verification-documents'
  and starts_with(name, 'id_' || auth.uid() || '/')
);

-- Users can read only their own files
create policy "Users can read their own verification docs"
on storage.objects
for select
using (
  auth.uid() is not null
  and bucket_id = 'verification-documents'
  and starts_with(name, 'id_' || auth.uid() || '/')
);

-- Users can delete only their own files
create policy "Users can delete their own verification docs"
on storage.objects
for delete
using (
  auth.uid() is not null
  and bucket_id = 'verification-documents'
  and starts_with(name, 'id_' || auth.uid() || '/')
);