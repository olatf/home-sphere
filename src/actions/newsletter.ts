'use server';

import { z } from 'zod';
import { SUPPORT_EMAIL } from '@/config/constants';
import { getErrorMessage } from '@/helpers/error.helpers';
import { escapeHtml } from '@/helpers/html.helpers';
import { rateLimitByIp } from '@/lib/rate-limit';
import { renderEmailShell } from '@/templates/emails/email-shell';
import { sendEmail } from './sendEmail';

const newsletterSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export async function subscribeToNewsletter(email: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const withinLimit = await rateLimitByIp('newsletter-signup', 5, 60 * 10);
    if (!withinLimit) {
      return {
        success: false,
        error: 'Too many attempts. Please try again later.',
      };
    }

    const result = newsletterSchema.safeParse({ email });

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? 'Invalid email address',
      };
    }

    await sendEmail({
      to: SUPPORT_EMAIL,
      subject: 'New newsletter subscriber',
      html: renderEmailShell({
        bodyHtml: `<p>${escapeHtml(result.data.email)} just subscribed to the Homesphere newsletter.</p>`,
      }),
    });

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
