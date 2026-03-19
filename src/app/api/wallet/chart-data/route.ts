import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

interface MonthlySummaryRow {
  month: string;
  total_credit: number;
  total_debit: number;
  deposits: number;
  withdrawals: number;
  rent_payments: number;
  inspection_payments: number;
  purchase_payments: number;
  transfers_out: number;
  transfers_in: number;
  transaction_count: number;
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const months = parseInt(searchParams.get('months') ?? '6');

    const { data, error } = await supabase.rpc('get_wallet_monthly_summary', {
      p_user_id: user.id,
      p_months: months,
    });

    if (error) throw error;

    const rows = (data ?? []) as MonthlySummaryRow[];

    const formatted = rows.map(row => ({
      month: format(new Date(row.month), 'MMM yy'),
      total_credit: Number(row.total_credit),
      total_debit: Number(row.total_debit),
      deposits: Number(row.deposits),
      withdrawals: Number(row.withdrawals),
      rent_payments: Number(row.rent_payments),
      inspection_payments: Number(row.inspection_payments),
      purchase_payments: Number(row.purchase_payments),
      transfers_out: Number(row.transfers_out),
      transfers_in: Number(row.transfers_in),
      transaction_count: Number(row.transaction_count),
    }));

    const totals = rows.reduce(
      (acc, row) => ({
        deposits: acc.deposits + Number(row.deposits),
        withdrawals: acc.withdrawals + Number(row.withdrawals),
        rent_payments: acc.rent_payments + Number(row.rent_payments),
        inspection_payments:
          acc.inspection_payments + Number(row.inspection_payments),
        purchase_payments:
          acc.purchase_payments + Number(row.purchase_payments),
        transfers_out: acc.transfers_out + Number(row.transfers_out),
        transfers_in: acc.transfers_in + Number(row.transfers_in),
      }),
      {
        deposits: 0,
        withdrawals: 0,
        rent_payments: 0,
        inspection_payments: 0,
        purchase_payments: 0,
        transfers_out: 0,
        transfers_in: 0,
      }
    );

    // Pie data — only show segments with a value
    const pieData = [
      { name: 'Deposits', value: totals.deposits, color: '#059669' },
      { name: 'Withdrawals', value: totals.withdrawals, color: '#f43f5e' },
      { name: 'Rent', value: totals.rent_payments, color: '#6366f1' },
      {
        name: 'Inspections',
        value: totals.inspection_payments,
        color: '#f59e0b',
      },
      { name: 'Purchases', value: totals.purchase_payments, color: '#3b82f6' },
      { name: 'Transfers Out', value: totals.transfers_out, color: '#8b5cf6' },
      { name: 'Transfers In', value: totals.transfers_in, color: '#10b981' },
    ].filter(d => d.value > 0);

    return NextResponse.json({ monthly: formatted, pie: pieData, totals });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
