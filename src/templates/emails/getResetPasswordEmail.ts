import { escapeHtml } from '@/helpers/html.helpers';
import { renderEmailShell } from './email-shell';

interface ResetPasswordData {
  customerName: string;
}

export function getResetPasswordEmailHTML({
  customerName,
}: ResetPasswordData): string {
  return renderEmailShell({
    bodyHtml: `
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 600; margin-bottom: 16px;">
        Password reset successful
      </h2>
      <p>Hi ${escapeHtml(customerName) || 'there'},</p>
      <p>Your Homesphere account password was just changed. If this was you, no further action is needed.</p>
      <p>If you didn't make this change, please contact support immediately to secure your account.</p>
    `,
  });
}
