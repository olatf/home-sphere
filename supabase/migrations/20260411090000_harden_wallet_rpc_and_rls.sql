-- SECURITY + CORRECTNESS FIX
--
-- 1. credit_wallet / debit_wallet / withdraw_wallet were never marked
--    SECURITY DEFINER (unlike transfer_wallet_funds, which was fixed in a
--    later migration). They run as SECURITY INVOKER by default, so when
--    called via the regular session-scoped client — as
--    src/actions/tenancy.ts does for debit_wallet — their internal
--    `update wallets` statement is subject to the CALLER's own RLS
--    permissions. Once the self-service "Users can update own wallet"
--    policy is gone (see 20260410090100_harden_rls_policies.sql), that
--    update would silently affect zero rows: the debit would appear to
--    succeed (no error) while the balance never actually changes.
--    Marking these SECURITY DEFINER makes them behave like
--    transfer_wallet_funds — safe to call from any context, regardless of
--    the caller's own table privileges, because the function body only
--    ever performs one exact, tightly-scoped balance mutation.
--
--    While in here: added row locking (`for update`) to prevent a race
--    between concurrent debits/credits on the same wallet, and an
--    insufficient-balance guard on debit_wallet/withdraw_wallet (only
--    transfer_wallet_funds had one before — the other two could silently
--    push a balance negative).
--
-- 2. "Users can update own wallet transactions" / "...delete own wallet
--    transactions" and the equivalent withdrawals policies had no WITH
--    CHECK at all. The only legitimate caller of the UPDATE policy
--    (api/paystack/verify/route.ts) has been switched to the admin client
--    in the same change set as this migration, so these can now be
--    dropped outright — nothing else in the app relies on a user being
--    able to update or delete their own transaction/withdrawal rows
--    directly.

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
