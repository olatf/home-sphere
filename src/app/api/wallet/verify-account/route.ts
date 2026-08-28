import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/helpers/error.helpers';
import { verifyAccountNumber } from '@/lib/paystack';
import { createClient } from '@/lib/supabase/server';

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
    const account_number = searchParams.get('account_number');
    const bank_code = searchParams.get('bank_code');

    if (!account_number || !bank_code) {
      return NextResponse.json(
        { error: 'account_number and bank_code are required' },
        { status: 400 }
      );
    }

    const result = await verifyAccountNumber(account_number, bank_code);

    return NextResponse.json({ account_name: result.data.account_name });
  } catch (err) {
    const message = getErrorMessage(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
