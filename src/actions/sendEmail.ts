'use server';

import {
  DEFAULT_EMAIL_SEND_FROM,
  RESEND_API_KEY,
  RESEND_EMAIL_URL,
} from '@/config/constants';

/**
 * Generic email sender using Resend API.
 *
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML body of the email
 * @param from - (optional) Sender email. Defaults to HomeSphere <onboarding@resend.dev>
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = DEFAULT_EMAIL_SEND_FROM,
  attachments,
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;
}) {
  if (!RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY configuration');
  }

  const response = await fetch(RESEND_EMAIL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      ...(attachments?.length ? { attachments } : {}),
    }),
  });

  if (!response.ok) {
    let errorMessage = response.statusText;

    try {
      const errorData = (await response.json()) as { message?: string };
      if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch {
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch {
        // no-op
      }
    }

    throw new Error(`Resend send failed (${response.status}): ${errorMessage}`);
  }

  return response.json();
}
