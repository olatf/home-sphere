import { NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/paystack';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const admin = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    // Prevent double-crediting — check if already completed
    const { data: existing } = await supabase
      .from('wallet_transactions')
      .select('status, amount, wallet_id')
      .eq('reference', reference)
      .eq('user_id', user.id)
      .single();

    if (existing?.status === 'completed') {
      return NextResponse.json({
        message: 'Transaction already processed',
        alreadyDone: true,
      });
    }

    // Verify with Paystack
    const { data: tx } = await verifyTransaction(reference);

    if (tx.status !== 'success') {
      await supabase
        .from('wallet_transactions')
        .update({ status: 'failed' })
        .eq('reference', reference)
        .eq('user_id', user.id);

      return NextResponse.json(
        { error: 'Payment was not successful' },
        { status: 400 }
      );
    }

    const amountNaira = tx.amount / 100;

    // Fetch the user's wallet
    const { data: wallet, error: walletErr } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Credit wallet using DB function
    const { error: creditErr } = await admin.rpc('credit_wallet', {
      wallet: wallet.id,
      amount: amountNaira,
    });

    if (creditErr) throw creditErr;

    // Mark transaction as completed
    await supabase
      .from('wallet_transactions')
      .update({
        status: 'completed',
        wallet_id: wallet.id,
        amount: amountNaira,
      })
      .eq('reference', reference)
      .eq('user_id', user.id);

    // Ledger entry for audit trail
    await admin.from('wallet_ledger').insert({
      credit_wallet: wallet.id,
      amount: amountNaira,
      transaction_type: 'deposit',
      reference,
    });

    return NextResponse.json({ success: true, amount: amountNaira });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
