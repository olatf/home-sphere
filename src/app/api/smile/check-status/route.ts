import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSmileBaseUrl } from '@/lib/smile/config';

interface CheckStatusRequest {
  userId: string;
  jobId?: string;
}

/**
 * Check document verification status from SmileID
 * This is called by the cron job to see if verification is complete
 */
export async function POST(req: Request) {
  try {
    const { userId, jobId } = (await req.json()) as CheckStatusRequest;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const partnerId = process.env.SMILE_ID_PARTNER_ID!;
    const apiKey = process.env.SMILE_ID_API_KEY!;

    const timestamp = new Date().toISOString();

    // Generate signature
    const signature = crypto
      .createHmac('sha256', apiKey)
      .update(partnerId + timestamp)
      .digest('hex');

    // Query job status
    const body = {
      partner_id: partnerId,
      timestamp,
      signature,
      user_id: userId,
      job_id: jobId || `doc-${userId}`,
    };

    const response = await fetch(
      `${getSmileBaseUrl()}/id_verification?include_images=true&include_history=false`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to query SmileID' },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      job_complete: data.job_complete,
      result: data.result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error checking SmileID status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
