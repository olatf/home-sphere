import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/helpers/error.helpers';
import { generateReference } from '@/lib/paystack';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { TransactionType } from '@/stores/paymentStore';

interface WalletPaymentBody {
  amount: number;
  transactionType: TransactionType;
  receiverWalletId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

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

    const body: WalletPaymentBody = await req.json();
    const { amount, transactionType, receiverWalletId, description } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Fetch sender's wallet
    const { data: senderWallet, error: walletErr } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user.id)
      .single();

    if (walletErr || !senderWallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    if (senderWallet.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient wallet balance' },
        { status: 400 }
      );
    }

    const reference = generateReference('PAY');

    if (receiverWalletId) {
      // Transfer between wallets
      const { error: transferErr } = await admin.rpc('transfer_wallet_funds', {
        sender: senderWallet.id,
        receiver: receiverWalletId,
        amount,
      });

      if (transferErr) throw transferErr;

      // Record sender transaction
      await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        wallet_id: senderWallet.id,
        transaction_type: transactionType,
        type: 'debit',
        amount,
        status: 'completed',
        reference,
        description,
      });
    } else {
      // Simple debit (e.g. service fee, inspection)
      const { error: debitErr } = await admin.rpc('debit_wallet', {
        wallet: senderWallet.id,
        amount,
      });

      if (debitErr) throw debitErr;

      await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        wallet_id: senderWallet.id,
        transaction_type: transactionType,
        type: 'debit',
        amount,
        status: 'completed',
        reference,
        description,
      });

      await admin.from('wallet_ledger').insert({
        debit_wallet: senderWallet.id,
        amount,
        transaction_type: transactionType,
        reference,
      });
    }

    return NextResponse.json({ success: true, reference });
  } catch (err) {
    const message = getErrorMessage(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
