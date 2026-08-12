import { escapeHtml } from '@/helpers/html.helpers';
import { renderEmailShell } from './email-shell';

export function getOnboardingEmailHTML(userName?: string): string {
  const name = escapeHtml(userName?.trim()) || 'there';

  return renderEmailShell({
    bodyHtml: `
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 600; margin-bottom: 16px;">
        Welcome aboard
      </h2>
      <p>Hi ${name},</p>
      <p>Thank you for completing your onboarding with Homesphere. We've
      received your information, and your account verification is
      currently in progress.</p>
      <p>Our team will review your submission and notify you once
      verification is complete. If we need anything further, we'll reach
      out directly.</p>
    `,
  });
}
