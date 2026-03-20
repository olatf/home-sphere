import { NextResponse } from 'next/server';
import { listBanks } from '@/lib/paystack';
import { getErrorMessage } from '@/helpers/error.helpers';

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
