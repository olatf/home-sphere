import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/helpers/error.helpers';
import { listBanks } from '@/lib/paystack';

export const revalidate = 3600;

export async function GET() {
  try {
    const { data } = await listBanks('nigeria');
    return NextResponse.json({ banks: data });
  } catch (err) {
    const message = getErrorMessage(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
