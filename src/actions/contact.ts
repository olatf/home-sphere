'use server';

import { SUPPORT_EMAIL } from '@/config/constants';
import { getErrorMessage } from '@/helpers/error.helpers';
import { type ContactFormData, contactSchema } from '@/lib/schemas/contact';
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
      html: `
        <p><strong>From:</strong> ${fullName} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
