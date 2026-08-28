-- Fix: 'transfer' is not a valid transaction_types_enum value.
-- The correct value is 'admin_transfer'.

create or replace function transfer_wallet_funds(
  sender uuid,
  receiver uuid,
  amount numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  sender_balance numeric;
begin

  -- Lock sender row to prevent race conditions
  select balance into sender_balance
  from wallets
  where id = sender
  for update;

  if sender_balance < amount then
    raise exception 'Insufficient balance';
  end if;

  -- Debit sender
  update wallets
  set
    balance = balance - amount,
    total_spent = total_spent + amount
  where id = sender;

  -- Credit receiver
  update wallets
  set
    balance = balance + amount,
    total_deposit = total_deposit + amount
  where id = receiver;

  insert into wallet_ledger(
    debit_wallet,
    credit_wallet,
    amount,
    transaction_type
  )
  values(sender, receiver, amount, 'admin_transfer');

end;
$$;