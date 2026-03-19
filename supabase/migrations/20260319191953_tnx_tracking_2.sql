
-- Step 2: Recreate the view to handle the new types correctly

CREATE OR REPLACE VIEW public.wallet_monthly_summary AS
SELECT
  user_id,
  DATE_TRUNC('month', created_at)                                                   AS month,
  SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END)                            AS total_credit,
  SUM(CASE WHEN type = 'debit'  THEN amount ELSE 0 END)                            AS total_debit,
  SUM(CASE WHEN transaction_type = 'deposit'            THEN amount ELSE 0 END)     AS deposits,
  SUM(CASE WHEN transaction_type = 'withdrawal'         THEN amount ELSE 0 END)     AS withdrawals,
  SUM(CASE WHEN transaction_type = 'rent_payment'       THEN amount ELSE 0 END)     AS rent_payments,
  SUM(CASE WHEN transaction_type = 'inspection_payment' THEN amount ELSE 0 END)     AS inspection_payments,
  SUM(CASE WHEN transaction_type = 'purchase_payment'   THEN amount ELSE 0 END)     AS purchase_payments,
  SUM(CASE WHEN transaction_type IN ('transfer_out', 'admin_transfer') AND type = 'debit'
                                                        THEN amount ELSE 0 END)     AS transfers_out,

  SUM(CASE WHEN transaction_type IN ('transfer_in', 'admin_transfer') AND type = 'credit'
                                                        THEN amount ELSE 0 END)     AS transfers_in,
  COUNT(*)                                                                           AS transaction_count
FROM public.wallet_transactions
WHERE status = 'completed'
GROUP BY user_id, DATE_TRUNC('month', created_at);

ALTER VIEW public.wallet_monthly_summary OWNER TO postgres;

REVOKE ALL ON public.wallet_monthly_summary FROM PUBLIC;
REVOKE ALL ON public.wallet_monthly_summary FROM authenticated;
REVOKE ALL ON public.wallet_monthly_summary FROM anon;
GRANT SELECT ON public.wallet_monthly_summary TO postgres;

-- Step 3: Recreate the function with updated return columns
DROP FUNCTION IF EXISTS public.get_wallet_monthly_summary(uuid, int);

CREATE OR REPLACE FUNCTION public.get_wallet_monthly_summary(
  p_user_id uuid,
  p_months  int DEFAULT 6
)
RETURNS TABLE (
  month               timestamptz,
  total_credit        numeric,
  total_debit         numeric,
  deposits            numeric,
  withdrawals         numeric,
  rent_payments       numeric,
  inspection_payments numeric,
  purchase_payments   numeric,
  transfers_out       numeric,
  transfers_in        numeric,
  transaction_count   bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    month,
    total_credit,
    total_debit,
    deposits,
    withdrawals,
    rent_payments,
    inspection_payments,
    purchase_payments,
    transfers_out,
    transfers_in,
    transaction_count
  FROM public.wallet_monthly_summary
  WHERE user_id = p_user_id
    AND month >= DATE_TRUNC('month', NOW() - ((p_months - 1) || ' months')::interval)
  ORDER BY month ASC;
$$;

REVOKE ALL ON FUNCTION public.get_wallet_monthly_summary(uuid, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_wallet_monthly_summary(uuid, int) TO authenticated;