import { format } from 'date-fns';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface MonthlySummaryRow {
  month: string;
  total_credit: number;
  total_debit: number;
  // Credits
  deposits: number;
  transfers_in: number;
  landlord_payouts: number;
  admin_transfers_in: number;
  // Debits
  withdrawals: number;
  transfers_out: number;
  rent_payments: number;
  inspection_payments: number;
  purchase_payments: number;
  admin_transfers_out: number;
  transaction_count: number;
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const months = parseInt(searchParams.get('months') ?? '6', 10);

    const { data, error } = await supabase.rpc('get_wallet_monthly_summary', {
      p_user_id: user.id,
      p_months: months,
    });
    if (error) throw error;

    const rows = (data ?? []) as MonthlySummaryRow[];

    const monthly = rows.map(row => ({
      month: format(new Date(row.month), 'MMM yy'),
      // Credits (grouped for bar chart)
      deposits: Number(row.deposits),
      transfers_in: Number(row.transfers_in),
      landlord_payouts: Number(row.landlord_payouts),
      admin_transfers_in: Number(row.admin_transfers_in),
      // Debits (grouped for bar chart)
      withdrawals: Number(row.withdrawals),
      transfers_out: Number(row.transfers_out),
      rent_payments: Number(row.rent_payments),
      inspection_payments: Number(row.inspection_payments),
      purchase_payments: Number(row.purchase_payments),
      admin_transfers_out: Number(row.admin_transfers_out),
      // Totals
      total_credit: Number(row.total_credit),
      total_debit: Number(row.total_debit),
      transaction_count: Number(row.transaction_count),
    }));

    const totals = rows.reduce(
      (acc, row) => ({
        deposits: acc.deposits + Number(row.deposits),
        transfers_in: acc.transfers_in + Number(row.transfers_in),
        landlord_payouts: acc.landlord_payouts + Number(row.landlord_payouts),
        admin_transfers_in:
          acc.admin_transfers_in + Number(row.admin_transfers_in),
        withdrawals: acc.withdrawals + Number(row.withdrawals),
        transfers_out: acc.transfers_out + Number(row.transfers_out),
        rent_payments: acc.rent_payments + Number(row.rent_payments),
        inspection_payments:
          acc.inspection_payments + Number(row.inspection_payments),
        purchase_payments:
          acc.purchase_payments + Number(row.purchase_payments),
        admin_transfers_out:
          acc.admin_transfers_out + Number(row.admin_transfers_out),
      }),
      {
        deposits: 0,
        transfers_in: 0,
        landlord_payouts: 0,
        admin_transfers_in: 0,
        withdrawals: 0,
        transfers_out: 0,
        rent_payments: 0,
        inspection_payments: 0,
        purchase_payments: 0,
        admin_transfers_out: 0,
      }
    );

    // ── Pie segments — only include non-zero values
    const pieData = [
      // Credits (greens)
      {
        name: 'Deposits',
        value: totals.deposits,
        color: '#059669',
        group: 'in',
      },
      {
        name: 'Transfers In',
        value: totals.transfers_in,
        color: '#10b981',
        group: 'in',
      },
      {
        name: 'Landlord Payouts',
        value: totals.landlord_payouts,
        color: '#34d399',
        group: 'in',
      },
      {
        name: 'Admin Credits',
        value: totals.admin_transfers_in,
        color: '#6ee7b7',
        group: 'in',
      },
      // Debits (reds / purples)
      {
        name: 'Withdrawals',
        value: totals.withdrawals,
        color: '#f43f5e',
        group: 'out',
      },
      {
        name: 'Rent',
        value: totals.rent_payments,
        color: '#1b5e40',
        group: 'out',
      },
      {
        name: 'Inspections',
        value: totals.inspection_payments,
        color: '#f59e0b',
        group: 'out',
      },
      {
        name: 'Purchases',
        value: totals.purchase_payments,
        color: '#3b82f6',
        group: 'out',
      },
      {
        name: 'Transfers Out',
        value: totals.transfers_out,
        color: '#8b5cf6',
        group: 'out',
      },
      {
        name: 'Admin Debits',
        value: totals.admin_transfers_out,
        color: '#c084fc',
        group: 'out',
      },
    ].filter(d => d.value > 0);

    return NextResponse.json({ monthly, pie: pieData, totals });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
