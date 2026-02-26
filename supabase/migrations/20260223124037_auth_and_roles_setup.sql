-- Enable uuid extension if not already
create extension if not exists "uuid-ossp";

-- USER PROFILES TABLE
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  is_email_verified boolean,
  date_of_birth date,
  nationality text,
  avatar_url text,
  city text,
  bio text,
  interest text,
  verification_img text,
  onboarding_completed boolean,
  is_account_verified boolean,
  phone text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);


-- ROLES
create type public.app_role as enum (
  'admin',
  'superAdmin',
  'administrator',
  'tenant',
  'landlord'
);

-- USER ROLES TABLE

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamp with time zone default now(),
  unique(user_id, role)
);

alter table public.user_profiles enable row level security;
alter table public.user_roles enable row level security;

create policy "Users can view own profile"
on public.user_profiles
for select
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.user_profiles
for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.user_profiles
for update
using (auth.uid() = id);

create policy "Users can view own roles"
on public.user_roles
for select
using (auth.uid() = user_id);

create policy "Users can update own roles"
on public.user_roles
for update
using (auth.uid() = user_id);


create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.user_roles (user_id, role)
  values (new.id, 'tenant'); -- default role

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.get_user_role_flags()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  select json_build_object(
    'isAdmin', exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin' or role = 'superAdmin' or role = 'administrator'
    ),
    'isTenant', exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'tenant'
    ),
    'isLandlord', exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'landlord'
    )
  )
  into result;

  return result;
end;
$$;