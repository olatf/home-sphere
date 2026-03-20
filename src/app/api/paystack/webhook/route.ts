import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PAYSTACK_SECRET_KEY } from '@/config/constants';

/**
 * Paystack sends webhook events for payment.success, transfer.success, etc.
 * This is a backup to the client-side verify flow — it handles cases where the
 * user closes the browser before the callback fires.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  // Validate webhook signature
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  const supabase = await createClient();
  const admin = await createAdminClient();

  switch (event.event) {
    case 'charge.success': {
      const { reference, amount, metadata, status } = event.data;

      if (status !== 'success') break;

      // Check idempotency
      const { data: existing } = await admin
        .from('wallet_transactions')
        .select('status, user_id')
        .eq('reference', reference)
        .single();

      if (!existing || existing.status === 'completed') break;

      const amountNaira = amount / 100;
      const userId = existing.user_id ?? metadata?.user_id;

      if (!userId) break;

      const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!wallet) break;

      await admin.rpc('credit_wallet', {
        wallet: wallet.id,
        amount: amountNaira,
      });

      await admin
        .from('wallet_transactions')
        .update({ status: 'completed', wallet_id: wallet.id })
        .eq('reference', reference);

      await admin.from('wallet_ledger').insert({
        credit_wallet: wallet.id,
        amount: amountNaira,
        transaction_type: 'deposit',
        reference,
      });

      break;
    }

    case 'transfer.success': {
      const { reference } = event.data;

      await admin
        .from('withdrawals')
        .update({ status: 'success' })
        .eq('reference', reference);

      break;
    }

    case 'transfer.failed':
    case 'transfer.reversed': {
      const { reference, amount } = event.data;

      // Refund the wallet on failed transfer
      const { data: withdrawal } = await admin
        .from('withdrawals')
        .select('user_id')
        .eq('reference', reference)
        .single();

      if (withdrawal) {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('id')
          .eq('user_id', withdrawal.user_id)
          .single();

        if (wallet) {
          await admin.rpc('credit_wallet', {
            wallet: wallet.id,
            amount: amount / 100,
          });
        }

        await admin
          .from('withdrawals')
          .update({
            status: event.event === 'transfer.failed' ? 'failed' : 'reversed',
          })
          .eq('reference', reference);
      }

      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
