'use server';

import { z } from 'zod';
import { SUPPORT_EMAIL } from '@/config/constants';
import { getErrorMessage } from '@/helpers/error.helpers';
import { escapeHtml } from '@/helpers/html.helpers';
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
