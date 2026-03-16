import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    console.log('Smile webhook received:', payload);
    const supabase = await createAdminClient();

    const userId = payload?.partner_params?.user_id;
    const jobType = payload?.partner_params?.job_type;
    const resultCode = payload?.result?.ResultCode;
    const resultText = payload?.result?.ResultText;

    if (!userId) {
      console.error('No user ID in webhook payload');
      return NextResponse.json(
        { success: false, error: 'Missing user ID' },
        { status: 400 }
      );
    }

    const isVerified = resultCode === 0 || resultText === 'Verified';

    // Job Type 6: Document Verification
    if (jobType === 6) {
      if (isVerified) {
        await supabase
          .from('user_profiles')
          .update({
            is_documents_verified: true,
            verification_status: 'documents_approved',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        await supabase.from('messages').insert({
          user_id: userId,
          is_read: false,
          subject: 'Document verification approved',
          type: 'verification',
          body: 'Your ID document has been verified successfully. Please proceed to live verification.',
        });
      } else {
        await supabase
          .from('user_profiles')
          .update({
            is_documents_verified: false,
            verification_status: 'documents_failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        await supabase.from('messages').insert({
          user_id: userId,
          is_read: false,
          subject: 'Document verification failed',
          type: 'verification',
          body: 'Document verification failed. Please re-upload a clear image of your ID.',
        });
      }
    }

    // Job Type 2: Liveness/Selfie Verification
    if (jobType === 2) {
      if (isVerified) {
        await supabase
          .from('user_profiles')
          .update({
            is_live_verified: true,
            is_account_verified: true,
            verification_status: 'fully_verified',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        await supabase.from('messages').insert({
          user_id: userId,
          is_read: false,
          subject: 'Live verification complete',
          type: 'verification',
          body: 'Your account has been fully verified! Welcome to HomeSphere.',
        });
      } else {
        await supabase
          .from('user_profiles')
          .update({
            is_live_verified: false,
            verification_status: 'live_pending',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        await supabase.from('messages').insert({
          user_id: userId,
          is_read: false,
          subject: 'Live verification failed',
          type: 'verification',
          body: 'Live verification failed. Please try again.',
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: 500 }
    );
  }
}
