import { NextResponse } from 'next/server';
import { getSmileBaseUrl } from '@/lib/smile/config';
import { SMILE_CALLBACK_URL_PATH } from '@/config/constants';

export async function POST(req: Request) {
  const { userId } = await req.json();

  // Use origin from incoming request to create absolute URL
  const origin = new URL(req.url).origin;
  const res = await fetch(`${origin}/api/smile/generate-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  const configData = await res.json();

  const jobId = `live-${Date.now()}`;

  // compute callback url
  const smileCallbackPath = SMILE_CALLBACK_URL_PATH;
  const callbackUrl =
    smileCallbackPath && !smileCallbackPath.startsWith('undefined')
      ? smileCallbackPath
      : `${origin}/api/smile/webhook`;

  const response = await fetch(`${getSmileBaseUrl()}/selfie_verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'smile-partner-id': process.env.SMILE_ID_PARTNER_ID!,
      'smile-signature': configData.signature,
      'smile-timestamp': configData.timestamp,
    },
    body: JSON.stringify({
      partner_params: {
        user_id: userId,
        job_id: jobId,
        job_type: 2, // 2 = Selfie only
      },
      callback_url: callbackUrl,
    }),
  });

  const data = await response.json();

  return NextResponse.json(data);
}
