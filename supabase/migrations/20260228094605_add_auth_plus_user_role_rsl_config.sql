-- Enable uuid extension if not already

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";



-- VERIFICATION STATUS ENUM
CREATE TYPE public.verification_status_enum AS ENUM (
  'not_started',
  'pending_documents',
  'documents_submitted',
  'documents_verification_pending'
  'documents_failed',
  'documents_approved',
  'live_pending',
  'fully_verified'
);

ALTER TYPE public.verification_status_enum OWNER TO "postgres";


-- ROLES
create type public.app_role as enum (
  'admin',
  'superAdmin',
  'administrator',
  'tenant',
  'landlord',
  'user'
);

ALTER TYPE public.app_role OWNER TO "postgres";


-- USER PROFILES TABLE
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  is_email_verified boolean default false,
  date_of_birth date,
  nationality text,
  avatar_url text,
  city text,
  bio text,
  interest text[] DEFAULT '{}',
  verification_img text,
  selfie_img text,
  is_documents_verified boolean default false,
  is_live_verified boolean default false,
  verification_status public.verification_status_enum default 'not_started',
  onboarding_completed boolean default false,
  is_account_verified boolean default false,
  smile_job_id text default null,
  id_type text default null,
  id_number text default null,
  phone text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

ALTER TABLE public.user_profiles OWNER TO "postgres";

-- USER ROLES TABLE

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamp with time zone default now(),
  unique(user_id, role)
);

ALTER TABLE public.user_roles OWNER TO "postgres";

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
  insert into public.user_profiles (id, full_name )
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.user_roles (user_id, role)
  values (new.id, 'user'); -- default role

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
