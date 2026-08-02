import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/helpers/error.helpers';
import { generateReference } from '@/lib/paystack';
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

    const { receiverWalletId, amount, note } = await req.json();

    if (!receiverWalletId || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid transfer parameters' },
        { status: 400 }
      );
    }

    if (Number(amount) < 100) {
      return NextResponse.json(
        { error: 'Minimum transfer amount is ₦100' },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);

    const { data: senderWallet, error: senderErr } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user.id)
      .single();

    if (senderErr || !senderWallet) {
      return NextResponse.json(
        { error: 'Your wallet was not found' },
        { status: 404 }
      );
    }

    if (senderWallet.balance < numericAmount) {
      return NextResponse.json(
        { error: 'Insufficient wallet balance' },
        { status: 400 }
      );
    }

    const { data: receiverWallet, error: receiverErr } = await admin
      .from('wallets')
      .select('id, user_id')
      .eq('id', receiverWalletId)
      .single();

    if (receiverErr || !receiverWallet) {
      return NextResponse.json(
        { error: 'Recipient wallet not found' },
        { status: 404 }
      );
    }

    if (receiverWallet.user_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot transfer to your own wallet' },
        { status: 400 }
      );
    }

    const reference = generateReference('TRF');
    const description = note?.trim()
      ? `Transfer: ${note.trim()}`
      : 'Wallet transfer';

    const { error: transferErr } = await admin.rpc('transfer_wallet_funds', {
      sender: senderWallet.id,
      receiver: receiverWalletId,
      amount: numericAmount,
    });

    if (transferErr) throw transferErr;

    // Record both transaction legs in parallel
    await Promise.all([
      supabase.from('wallet_transactions').insert({
        user_id: user.id,
        wallet_id: senderWallet.id,
        transaction_type: 'transfer_out',
        type: 'debit',
        amount: numericAmount,
        status: 'completed',
        reference,
        description,
      }),
      admin.from('wallet_transactions').insert({
        user_id: receiverWallet.user_id,
        wallet_id: receiverWalletId,
        transaction_type: 'transfer_in',
        type: 'credit',
        amount: numericAmount,
        status: 'completed',
        reference,
        description,
      }),
    ]);

    return NextResponse.json({ success: true, reference });
  } catch (err) {
    const message = getErrorMessage(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
