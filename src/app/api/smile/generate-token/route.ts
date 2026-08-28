import crypto from 'node:crypto';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { userId } = await req.json();

  const partnerId = process.env.SMILE_ID_PARTNER_ID!;
  const apiKey = process.env.SMILE_ID_API_KEY!;

  const timestamp = new Date().toISOString();

  const signature = crypto
    .createHmac('sha256', apiKey)
    .update(`${timestamp + partnerId}sid_request`)
    .digest('hex');

  return NextResponse.json({
    timestamp,
    userId,
    signature,
  });
}
