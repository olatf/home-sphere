
--  Add the new enum value if it doesn't exist yet
ALTER TYPE public.transaction_types_enum
ADD VALUE IF NOT EXISTS 'wallet_transfer';


ALTER TYPE public.transaction_types_enum ADD VALUE IF NOT EXISTS 'transfer_in';
ALTER TYPE public.transaction_types_enum ADD VALUE IF NOT EXISTS 'transfer_out';