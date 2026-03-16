

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  author_name text,
  author_email text,
  type text,
  is_read boolean default false,
  created_at timestamp default now()
);


ALTER TABLE public.messages OWNER TO "postgres";

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;


-- Check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role in ('admin', 'superAdmin', 'administrator')
  );
$$;

ALTER FUNCTION public.is_admin() OWNER TO postgres;

-- Check if current user is tenant
create or replace function public.is_tenant()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'tenant'
  );
$$;

ALTER FUNCTION public.is_tenant() OWNER TO postgres;

-- Check if current user is landlord
create or replace function public.is_landlord()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'landlord'
  );
$$;



ALTER FUNCTION public.is_landlord() OWNER TO postgres;



CREATE POLICY "Users can read own messages"
ON public.messages
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can delete own messages"
ON public.messages
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Admin can read all messages"
ON public.messages
FOR SELECT
TO authenticated
USING ((public.is_admin()));

CREATE POLICY "Admin can insert messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  (public.is_admin())
);

CREATE POLICY "Admin can update messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  (public.is_admin())
);

CREATE POLICY "Admin can delete any message"
ON public.messages
FOR DELETE
TO authenticated
USING (
  (public.is_admin())
);
