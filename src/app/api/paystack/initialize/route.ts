import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateReference, initializeTransaction } from '@/lib/paystack';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || isNaN(Number(amount)) || Number(amount) < 100) {
      return NextResponse.json(
        { error: 'Minimum top-up amount is ₦100' },
        { status: 400 }
      );
    }

    const reference = generateReference('TOP');

    const { data } = await initializeTransaction({
      email: user.email!,
      amount: Number(amount),
      reference,
      metadata: {
        user_id: user.id,
        type: 'wallet_topup',
      },
      channels: ['card', 'bank_transfer', 'ussd'],
    });

    // Pre-create a pending transaction record
    await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      transaction_type: 'deposit',
      type: 'credit',
      amount: Number(amount),
      status: 'pending',
      reference,
      description: 'Wallet top-up via card',
    });

    return NextResponse.json({
      authorization_url: data.authorization_url,
      access_code: data.access_code,
      reference: data.reference,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
