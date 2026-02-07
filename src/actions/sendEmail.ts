'use server';

import { RESEND_API_KEY, RESEND_EMAIL_URL } from '@/config/constants';

/**
 * Generic email sender using Resend API.
 *
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML body of the email
 * @param from - (optional) Sender email. Defaults to FP&A <onboarding@ahonsi.com>
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = 'HomeSphere <onboarding@resend.dev>',
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
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
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to send email: ${errorData.message || response.statusText}`
    );
  }
  return await response.json();
}
