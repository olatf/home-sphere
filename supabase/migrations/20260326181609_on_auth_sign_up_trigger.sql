create or replace function public.handle_new_user_signup()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  unique_wallet_id text;
begin
  -- 1. Create the User Profile
  insert into public.user_profiles (id, email)
  values (new.id, new.email);

  -- 2. Assign Default Role
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');

  -- 3. Generate Wallet ID and Create Wallet
  unique_wallet_id := 'HMS-' || upper(substring(extensions.gen_random_uuid()::text from 1 for 8));

  insert into public.wallets (user_id, wallet_id)
  values (new.id, unique_wallet_id);

  return new;
end;
$$;


ALTER FUNCTION public.handle_new_user_signup() OWNER TO postgres;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_signup();
