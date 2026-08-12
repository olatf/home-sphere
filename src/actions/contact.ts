'use server';

import { SUPPORT_EMAIL } from '@/config/constants';
import { getErrorMessage } from '@/helpers/error.helpers';
import { escapeHtml } from '@/helpers/html.helpers';
import { type ContactFormData, contactSchema } from '@/lib/schemas/contact';
import { renderEmailShell } from '@/templates/emails/email-shell';
import { sendEmail } from './sendEmail';

export async function submitContactForm(data: ContactFormData): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const result = contactSchema.safeParse(data);

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message ?? 'Invalid form data',
      };
    }

    const { fullName, email, subject, message } = result.data;

    await sendEmail({
      to: SUPPORT_EMAIL,
      subject: `New contact message: ${subject}`,
      html: renderEmailShell({
        bodyHtml: `
          <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 600; margin-bottom: 16px;">
            New contact message
          </h2>
          <p><strong>From:</strong> ${escapeHtml(fullName)} (${escapeHtml(email)})</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
        `,
      }),
    });

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
