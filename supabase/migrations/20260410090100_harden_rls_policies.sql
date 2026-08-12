
drop policy if exists "Users can update own roles" on public.user_roles;
drop policy if exists "Users can insert own roles" on public.user_roles;

create policy "Users can self-assign non-privileged roles"
on public.user_roles
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and role in ('tenant', 'landlord', 'agent', 'user')
);

create policy "Users can self-insert non-privileged roles"
on public.user_roles
for insert
to authenticated
with check (
  auth.uid() = user_id
  and role in ('tenant', 'landlord', 'agent', 'user')
);

drop policy if exists "Users can update own wallet" on public.wallets;
drop policy if exists "Users can delete own wallet" on public.wallets;
