
create or replace function credit_wallet(
  wallet uuid,
  amount numeric
)
returns void
language plpgsql
security definer
set search_path = public
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
security definer
set search_path = public
as $$
declare
  current_balance numeric;
begin
  select balance into current_balance
  from wallets
  where id = wallet
  for update;

  if current_balance is null then
    raise exception 'Wallet not found';
  end if;

  if current_balance < amount then
    raise exception 'Insufficient balance';
  end if;

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
security definer
set search_path = public
as $$
declare
  current_balance numeric;
begin
  select balance into current_balance
  from wallets
  where id = wallet
  for update;

  if current_balance is null then
    raise exception 'Wallet not found';
  end if;

  if current_balance < amount then
    raise exception 'Insufficient balance';
  end if;

  update wallets
  set
    balance = balance - amount,
    total_withdrawal = total_withdrawal + amount
  where id = wallet;
end;
$$;

drop policy if exists "Users can update own wallet transactions" on public.wallet_transactions;
drop policy if exists "Users can delete own wallet transactions" on public.wallet_transactions;
drop policy if exists "Users can update own withdrawals" on public.withdrawals;
drop policy if exists "Users can delete own withdrawals" on public.withdrawals;
