create table public.wallets(
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade NOT NULL,
    balance numeric(12, 2) default 0,
    wallet_id text default null,
    total_withdrawal numeric(12, 2) default 0,
    total_spent numeric(12, 2) default 0,
    total_deposit numeric(12, 2) default 0,
    currency text default 'NGN',
    created_at timestamptz default now()
);

ALTER TABLE public.wallets OWNER TO "postgres";

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wallet"
ON public.wallets
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);
CREATE POLICY "Users can update own wallet"
ON public.wallets
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can delete own wallet"
ON public.wallets
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Admin has all permissions on wallet "
ON public.wallets
FOR ALL
TO authenticated
USING (
  (public.is_admin())
);


create table public.wallet_pins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pin_hash text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

ALTER TABLE public.wallet_pins OWNER TO "postgres";

ALTER TABLE public.wallet_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wallet pin"
ON public.wallet_pins
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);


CREATE POLICY "Users can update own wallet pin"
ON public.wallet_pins
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can delete own wallet pin"
ON public.wallet_pins
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
);


alter table wallets
add constraint wallets_wallet_id_unique unique (wallet_id);

alter table wallets
add constraint wallets_user_unique unique (user_id);

-- Transactions types
CREATE TYPE public.transaction_types_enum AS ENUM (
  'deposit',
  'inspection_payment',
  'rent_payment',
  'purchase_payment',
  'admin_transfer',
  'landlord_payout',
  'withdrawal'
);

ALTER TYPE public.transaction_types_enum OWNER TO "postgres";


create table public.wallet_transactions (
  id uuid primary key default uuid_generate_v4(),
  wallet_id uuid references wallets(id) on delete cascade,
  type text,
  transaction_type public.transaction_types_enum default 'deposit',
  amount numeric(12,2),
  status text default 'completed',
  user_id uuid references auth.users(id),
  reference text,
  description text,
  created_at timestamptz default now()
);

ALTER TABLE public.wallet_transactions OWNER TO "postgres";

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wallet transactions"
ON public.wallet_transactions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can insert own wallet transactions"
ON public.wallet_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can update own wallet transactions"
ON public.wallet_transactions
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can delete own wallet transactions"
ON public.wallet_transactions
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Admin has all permissions on wallet transactions"
ON public.wallet_transactions
FOR ALL
TO authenticated
USING (
  (public.is_admin())
);


create table public.wallet_ledger (
  id uuid primary key default uuid_generate_v4(),
  debit_wallet uuid,
  credit_wallet uuid,
  amount numeric(12,2),
  transaction_type public.transaction_types_enum default 'deposit',
  reference text,
  created_at timestamptz default now()
);

ALTER TABLE public.wallet_ledger OWNER TO "postgres";

ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin has all permissions on wallet ledger"
ON public.wallet_ledger
FOR ALL
TO authenticated
USING (
  (public.is_admin())
);


create table public.withdrawals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  amount numeric,
  bank_code text,
  account_number text,
  status text default 'pending',
  reference text,
  created_at timestamptz default now()
);

ALTER TABLE public.withdrawals OWNER TO "postgres";

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own withdrawals"
ON public.withdrawals
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can insert own withdrawals"
ON public.withdrawals
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can update own withdrawals"
ON public.withdrawals
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can delete own withdrawals"
ON public.withdrawals
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
);

CREATE POLICY "Admin has all permissions on withdrawals"
ON public.withdrawals
FOR ALL
TO authenticated
USING (
  (public.is_admin())
);



create or replace function create_wallet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  unique_wallet_id text;
begin

  unique_wallet_id :=
    'HMS-' || upper(substring(extensions.gen_random_uuid()::text from 1 for 8));

    insert into wallets(user_id, wallet_id)
    values (new.id, unique_wallet_id);

    return new;
end;
$$;

create trigger create_wallet_trigger
after insert on auth.users
for each row execute procedure create_wallet();


create or replace function transfer_wallet_funds(
 sender uuid,
 receiver uuid,
 amount numeric
)
returns void
language plpgsql
as $$
declare
  sender_balance numeric;
begin

  -- lock sender row
  select balance into sender_balance
  from wallets
  where id = sender
  for update;

  if sender_balance < amount then
    raise exception 'Insufficient balance';
  end if;

  -- debit sender
  update wallets
  set 
    balance = balance - amount,
    total_spent = total_spent + amount
  where id = sender;

  -- credit receiver
  update wallets
  set 
    balance = balance + amount,
    total_deposit = total_deposit + amount
  where id = receiver;

  -- ledger entry
  insert into wallet_ledger(
    debit_wallet,
    credit_wallet,
    amount,
    transaction_type
  )
  values(sender, receiver, amount, 'transfer');

end;
$$;

create or replace function credit_wallet(
  wallet uuid,
  amount numeric
)
returns void
language plpgsql
as $$
begin

  update wallets
  set 
    balance = balance + amount,
    total_deposit = total_deposit + amount
  where id = wallet;

end;
$$;

create or replace function debit_wallet(
  wallet uuid,
  amount numeric
)
returns void
language plpgsql
as $$
begin

  update wallets
  set 
    balance = balance - amount,
    total_spent = total_spent + amount
  where id = wallet;

end;
$$;

create or replace function withdraw_wallet(
  wallet uuid,
  amount numeric
)
returns void
language plpgsql
as $$
begin

  update wallets
  set 
    balance = balance - amount,
    total_withdrawal = total_withdrawal + amount
  where id = wallet;

end;
$$;