import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { normalizeCountry, normalizeIdType } from '../_shared/countryISO.ts';
import { getSmileBaseUrl, callbackUrl } from '../_shared/config.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

type Profile = {
  id: string;
  verification_img: string;
  selfie_img: string;
  id_type: string;
  nationality: string;
  id_number: string;
};

serve(async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select(
        'id, verification_img, selfie_img, id_type, nationality, id_number'
      )
      .eq('verification_status', 'documents_submitted')
      .lt('updated_at', tenMinutesAgo)
      .limit(20);

    if (error) throw error;

    if (!profiles?.length) {
      return new Response(
        JSON.stringify({ message: 'No users ready for verification' }),
        { status: 200 }
      );
    }

    for (const profile of profiles) {
      await triggerVerification(profile);
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: profiles.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification job failed:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    );
  }
});

async function triggerVerification(profile: Profile) {
  try {
    const { data: idDoc } = await supabase.storage
      .from('verification-documents')
      .download(profile.verification_img);

    const { data: selfie } = await supabase.storage
      .from('verification-documents')
      .download(profile.selfie_img);

    if (!idDoc || !selfie) {
      console.error('Image download failed', profile.id);
      return;
    }

    const idBase64 = await blobToBase64(idDoc);
    const selfieBase64 = await blobToBase64(selfie);

    const jobId = `doc-${Date.now()}-${profile.id}`;

    const timestamp = new Date().toISOString();

    const countryCode = normalizeCountry(profile.nationality);

    const idTypeCode = normalizeIdType(countryCode, profile.id_type);

    const signature = await createSmileSignature(
      Deno.env.get('SMILE_PARTNER_ID')!,
      timestamp,
      jobId
    );

    const payload = {
      partner_id: Deno.env.get('SMILE_PARTNER_ID'),
      job_id: jobId,
      job_type: 11,
      user_id: profile.id,

      id_info: {
        country: countryCode,
        id_type: idTypeCode,
        id_number: profile.id_number,
      },

      images: [
        {
          image_type_id: 1,
          image: idBase64,
        },
        {
          image_type_id: 0,
          image: selfieBase64,
        },
      ],

      options: {
        return_job_status: true,
        return_history: true,
        callback_url: callbackUrl,
      },
    };

    const smileRes = await fetch(`${getSmileBaseUrl()}/job`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smile-ID-Partner-ID': Deno.env.get('SMILE_PARTNER_ID')!,
        'X-Smile-ID-Timestamp': timestamp,
        'X-Smile-ID-Signature': signature,
      },
      body: JSON.stringify(payload),
    });

    const result = await smileRes.json();

    if (!smileRes.ok) {
      console.error('SmileID error:', result);
      return;
    }

    await supabase
      .from('user_profiles')
      .update({
        verification_status: 'documents_verification_pending',
        smile_job_id: result.job_id,
      })
      .eq('id', profile.id);
  } catch (err) {
    console.error('Verification failed for user', profile.id, err);
  }
}

async function blobToBase64(blob: Blob) {
  const buffer = await blob.arrayBuffer();

  const bytes = new Uint8Array(buffer);

  let binary = '';

  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

async function createSmileSignature(
  partnerId: string,
  timestamp: string,
  jobId: string
) {
  const secret = Deno.env.get('SMILE_API_KEY')!;

  const encoder = new TextEncoder();

  const message = partnerId + timestamp + jobId;

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );

  const bytes = new Uint8Array(signatureBuffer);

  let binary = '';

  bytes.forEach(b => (binary += String.fromCharCode(b)));

  return btoa(binary);
}
