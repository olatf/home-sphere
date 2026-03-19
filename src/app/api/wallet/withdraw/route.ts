import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  createTransferRecipient,
  generateReference,
  initiateTransfer,
  verifyAccountNumber,
} from '@/lib/paystack';
import { getErrorMessage } from '@/helpers/error.helpers';

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

    const { amount, bank_code, account_number } = await req.json();

    if (!amount || !bank_code || !account_number) {
      return NextResponse.json(
        { error: 'amount, bank_code, and account_number are required' },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);

    if (numericAmount < 100) {
      return NextResponse.json(
        { error: 'Minimum withdrawal is ₦100' },
        { status: 400 }
      );
    }

    // Step 1: Verify wallet balance
    const { data: wallet, error: walletErr } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user.id)
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    if (wallet.balance < numericAmount) {
      return NextResponse.json(
        { error: 'Insufficient wallet balance' },
        { status: 400 }
      );
    }

    // Step 2: Verify bank account with Paystack
    const accountVerification = await verifyAccountNumber(
      account_number,
      bank_code
    );
    const accountName = accountVerification.data.account_name;

    // Step 3: Create Paystack transfer recipient
    const recipient = await createTransferRecipient({
      type: 'nuban',
      name: accountName,
      account_number,
      bank_code,
    });

    const reference = generateReference('WDR');

    // Step 4: Initiate Paystack transfer BEFORE debiting the wallet
    const transfer = await initiateTransfer({
      source: 'balance',
      amount: numericAmount,
      recipient: recipient.data.recipient_code,
      reason: 'Wallet withdrawal',
      reference,
    });

    if (!transfer.status) {
      return NextResponse.json(
        {
          error: 'Paystack transfer could not be initiated. Please try again.',
        },
        { status: 502 }
      );
    }

    // Step 5: Debit wallet only after Paystack accepts the transfer
    const { error: withdrawErr } = await admin.rpc('withdraw_wallet', {
      wallet: wallet.id,
      amount: numericAmount,
    });

    if (withdrawErr) {
      throw withdrawErr;
    }

    await Promise.all([
      admin.from('withdrawals').insert({
        user_id: user.id,
        amount: numericAmount,
        bank_code,
        account_number,
        status: 'pending',
        reference,
      }),
      admin.from('wallet_transactions').insert({
        user_id: user.id,
        wallet_id: wallet.id,
        transaction_type: 'withdrawal',
        type: 'debit',
        amount: numericAmount,
        status: 'pending',
        reference,
        description: `Withdrawal to ${accountName} (${account_number})`,
      }),
    ]);

    return NextResponse.json({
      success: true,
      reference,
      account_name: accountName,
    });
  } catch (err) {
    const message = getErrorMessage(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
