

CREATE OR REPLACE VIEW public.wallet_monthly_summary AS
SELECT
  user_id,
  DATE_TRUNC('month', created_at)                                                         AS month,

  -- Totals
  SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END)                                  AS total_credit,
  SUM(CASE WHEN type = 'debit'  THEN amount ELSE 0 END)                                  AS total_debit,

  -- Credit types
  SUM(CASE WHEN transaction_type = 'deposit'          THEN amount ELSE 0 END)             AS deposits,
  SUM(CASE WHEN transaction_type = 'transfer_in'      THEN amount ELSE 0 END)             AS transfers_in,
  SUM(CASE WHEN transaction_type = 'landlord_payout'  THEN amount ELSE 0 END)             AS landlord_payouts,
  SUM(CASE WHEN transaction_type = 'admin_transfer'
           AND type = 'credit'                        THEN amount ELSE 0 END)             AS admin_transfers_in,

  -- Debit types
  SUM(CASE WHEN transaction_type = 'withdrawal'         THEN amount ELSE 0 END)           AS withdrawals,
  SUM(CASE WHEN transaction_type = 'transfer_out'       THEN amount ELSE 0 END)           AS transfers_out,
  SUM(CASE WHEN transaction_type = 'rent_payment'       THEN amount ELSE 0 END)           AS rent_payments,
  SUM(CASE WHEN transaction_type = 'inspection_payment' THEN amount ELSE 0 END)           AS inspection_payments,
  SUM(CASE WHEN transaction_type = 'purchase_payment'   THEN amount ELSE 0 END)           AS purchase_payments,
  SUM(CASE WHEN transaction_type = 'admin_transfer'
           AND type = 'debit'                         THEN amount ELSE 0 END)             AS admin_transfers_out,

  COUNT(*)                                                                                 AS transaction_count
FROM public.wallet_transactions
WHERE status = 'completed'
GROUP BY user_id, DATE_TRUNC('month', created_at);

ALTER VIEW public.wallet_monthly_summary OWNER TO postgres;

REVOKE ALL ON public.wallet_monthly_summary FROM PUBLIC;
REVOKE ALL ON public.wallet_monthly_summary FROM authenticated;
REVOKE ALL ON public.wallet_monthly_summary FROM anon;
GRANT  SELECT ON public.wallet_monthly_summary TO postgres;



DROP FUNCTION IF EXISTS public.get_wallet_monthly_summary(uuid, int);

CREATE OR REPLACE FUNCTION public.get_wallet_monthly_summary(
  p_user_id uuid,
  p_months  int DEFAULT 6
)
RETURNS TABLE (
  month                 timestamptz,
  total_credit          numeric,
  total_debit           numeric,
  deposits              numeric,
  transfers_in          numeric,
  landlord_payouts      numeric,
  admin_transfers_in    numeric,
  withdrawals           numeric,
  transfers_out         numeric,
  rent_payments         numeric,
  inspection_payments   numeric,
  purchase_payments     numeric,
  admin_transfers_out   numeric,
  transaction_count     bigint
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
    transfers_in,
    landlord_payouts,
    admin_transfers_in,
    withdrawals,
    transfers_out,
    rent_payments,
    inspection_payments,
    purchase_payments,
    admin_transfers_out,
    transaction_count
  FROM public.wallet_monthly_summary
  WHERE user_id = p_user_id
    AND month >= DATE_TRUNC('month', NOW() - ((p_months - 1) || ' months')::interval)
  ORDER BY month ASC;
$$;

REVOKE ALL ON FUNCTION public.get_wallet_monthly_summary(uuid, int) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.get_wallet_monthly_summary(uuid, int) TO authenticated;
