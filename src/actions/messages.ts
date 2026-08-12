'use server';

import { SITE_URL } from '@/config/constants';
import { getErrorMessage } from '@/helpers/error.helpers';
import { escapeHtml } from '@/helpers/html.helpers';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/supabase/guards';
import { createClient } from '@/lib/supabase/server';
import { renderEmailShell } from '@/templates/emails/email-shell';
import type { Message } from '@/types/property';
import { sendEmail } from './sendEmail';

interface SendParams {
  userId: string;
  subject: string;
  body: string;
  authorName?: string;
  authorEmail?: string;
  type?:
    | 'notification'
    | 'message'
    | 'task'
    | 'payment'
    | 'property'
    | 'system';
  sendEmailAlso?: boolean;
  toEmail?: string;
  emailButton?: { label: string; href: string } | null;
}

export async function sendMessage(p: SendParams) {
  const admin = await createAdminClient();

  const { error } = await admin.from('messages').insert({
    user_id: p.userId,
    subject: p.subject,
    body: p.body,
    author_name: p.authorName ?? 'HomeSphere',
    author_email: p.authorEmail ?? 'no-reply@homesphere.com',
    type: p.type ?? 'notification',
    is_read: false,
  });

  if (error) {
    console.error('[sendMessage]', error.message);
    return { success: false };
  }

  if (p.sendEmailAlso && p.toEmail) {
    await sendEmail({
      to: p.toEmail,
      subject: p.subject,
      html: renderEmailShell({
        bodyHtml: `
          <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 600; margin-bottom: 16px;">
            ${escapeHtml(p.subject)}
          </h2>
          ${p.body}
        `,
        button: p.emailButton ?? null,
      }),
    }).catch(() => {});
  }

  return { success: true };
}

// Event-specific notifications

export async function notifyPropertyApproved(
  landlordId: string,
  email: string,
  title: string,
  propertyId: string
) {
  return sendMessage({
    userId: landlordId,
    toEmail: email,
    type: 'property',
    sendEmailAlso: true,
    subject: '🎉 Property Approved!',
    body: `<p>Your property <strong>"${escapeHtml(title)}"</strong> has been approved and is now live on Homesphere.</p>`,
    emailButton: {
      label: 'View Property',
      href: `${SITE_URL}/landlord/properties/${propertyId}`,
    },
  });
}

export async function notifyPropertyRejected(
  landlordId: string,
  email: string,
  title: string,
  reason: string
) {
  return sendMessage({
    userId: landlordId,
    toEmail: email,
    type: 'property',
    sendEmailAlso: true,
    subject: 'Property Review Update',
    body: `<p>Your property <strong>"${escapeHtml(title)}"</strong> could not be approved.</p><p><strong>Reason:</strong> ${escapeHtml(reason)}</p><p>Please update your listing and resubmit.</p>`,
  });
}

export async function notifyInspectionDay(
  tenantId: string,
  status: 'scheduled' | 'completed' | 'cancelled',
  tenantEmail: string,
  propertyTitle: string,
  scheduledDate: string,
  expiresAt: string
) {
  const expiry = new Date(expiresAt).toLocaleDateString('en-NG', {
    dateStyle: 'long',
  });

  const scheduledDay = new Date(scheduledDate).toLocaleDateString('en-NG', {
    dateStyle: 'long',
  });

  const safeTitle = escapeHtml(propertyTitle);

  const title =
    status === 'scheduled'
      ? `<p>Your inspection for <strong>"${safeTitle}"</strong> has been scheduled.</p>`
      : status === 'completed'
        ? `<p>Your inspection for <strong>"${safeTitle}"</strong> has been completed.</p>`
        : `<p>Your inspection for <strong>"${safeTitle}"</strong> has been cancelled.</p>`;

  const infobody =
    status === 'scheduled'
      ? `<p>Your inspection is scheduled for <strong>${scheduledDay}</strong>. Please keep to the schedule.</p>`
      : status === 'completed'
        ? `<p>You have until <strong>${expiry}</strong> to commit to the property.</p>`
        : `<p>If you have any questions, please contact support.</p>`;

  await sendMessage({
    userId: tenantId,
    toEmail: tenantEmail,
    type: 'notification',
    sendEmailAlso: true,
    subject: '🔍 Inspection Notification',
    body: `${title}
           ${infobody}
           <p style="color:#b45309;">⚠️ The inspection fee is non-refundable if you do not commit in time.</p>`,
  });
}

export async function notifyInspectionBooked(
  tenantId: string,
  tenantEmail: string,
  propertyTitle: string
) {
  await sendMessage({
    userId: tenantId,
    toEmail: tenantEmail,
    type: 'notification',
    sendEmailAlso: true,
    subject: '🔍 Inspection Booked',
    body: `<p>Your inspection for <strong>"${escapeHtml(propertyTitle)}"</strong> is confirmed.</p>
             <p>A day will be scheduled for your inspection, please keep an eye on your inbox.</p>
             <p style="color:#b45309;">⚠️ The inspection fee is non-refundable if you do not commit in time.</p>`,
  }).catch(() => {});
}

export async function notifyPaymentReceived(
  tenantId: string,
  tenantEmail: string,
  landlordId: string,
  landlordEmail: string,
  propertyTitle: string,
  tenantTotal: number,
  landlordPayout: number,
  reference: string
) {
  const fmt = (n: number) =>
    `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  const safeTitle = escapeHtml(propertyTitle);
  const safeReference = escapeHtml(reference);

  await Promise.all([
    sendMessage({
      userId: tenantId,
      toEmail: tenantEmail,
      type: 'payment',
      sendEmailAlso: true,
      subject: '💰 Payment Successful',
      body: `<p>Your payment for <strong>"${safeTitle}"</strong> was successful.</p>
             <p><strong>Amount Paid:</strong> ${fmt(tenantTotal)}</p>
             <p><strong>Reference:</strong> ${safeReference}</p>
             <p>Welcome to your new home! 🏠</p>`,
    }),
    sendMessage({
      userId: landlordId,
      toEmail: landlordEmail,
      type: 'payment',
      sendEmailAlso: true,
      subject: '💰 Payout Received',
      body: `<p>A tenant has completed payment for <strong>"${safeTitle}"</strong>.</p>
             <p><strong>Your Payout:</strong> ${fmt(landlordPayout)}</p>
             <p><strong>Reference:</strong> ${safeReference}</p>
             <p>The funds have been credited to your Homesphere wallet.</p>`,
    }),
  ]);
}

export async function notifyTaskAssigned(
  assigneeId: string,
  email: string,
  taskTitle: string,
  _taskId: string,
  priority: string,
  dueDate?: Date | null
) {
  const safeTitle = escapeHtml(taskTitle);
  const safePriority = escapeHtml(priority);

  return sendMessage({
    userId: assigneeId,
    toEmail: email,
    type: 'task',
    sendEmailAlso: true,
    subject: `📋 New Task: ${taskTitle}`,
    body: `<p>You have been assigned a new task.</p>
           <p><strong>Task:</strong> ${safeTitle}</p>
           <p><strong>Priority:</strong> ${safePriority}</p>
           ${dueDate ? `<p><strong>Due:</strong> ${new Date(dueDate).toLocaleDateString('en-NG', { dateStyle: 'long' })}</p>` : ''}`,
    emailButton: { label: 'View Task', href: `${SITE_URL}/dashboard/tasks` },
  });
}

export async function notifyTaskForwarded(
  assigneeId: string,
  email: string,
  taskTitle: string,
  taskId: string,
  reason: string
) {
  return sendMessage({
    userId: assigneeId,
    toEmail: email,
    type: 'task',
    sendEmailAlso: true,
    subject: `➡️ Task Forwarded: ${taskTitle}`,
    body: `<p>A task has been forwarded to you.</p>
           <p><strong>Task:</strong> ${escapeHtml(taskTitle)}</p>
           <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>`,
    emailButton: { label: 'View Task', href: `${SITE_URL}/tasks/${taskId}` },
  });
}

export async function notifyAccountSuspended(
  userId: string,
  email: string,
  reason: string
) {
  return sendMessage({
    userId,
    toEmail: email,
    type: 'system',
    sendEmailAlso: true,
    subject: '🚫 Account Suspended',
    body: `<p>Your Homesphere account has been suspended.</p>
           <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
           <p>If you believe this is an error, please contact support.</p>`,
  });
}

export async function adminSendMessage(
  targetUserId: string,
  subject: string,
  body: string
) {
  try {
    await requireAdmin();
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }

  const supabase = await createClient();
  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: sender } = await admin
    .from('user_profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  return sendMessage({
    userId: targetUserId,
    subject,
    body,
    authorName: sender?.full_name ?? 'Admin',
    authorEmail: sender?.email,
    type: 'message',
  });
}

export async function getUserMessages(filters?: {
  type?: string;
  unreadOnly?: boolean;
  page?: number;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, data: null };

  const page = filters?.page ?? 1;
  const limit = 20;
  const from = (page - 1) * limit;

  let q = supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (filters?.type) q = q.eq('type', filters.type);
  if (filters?.unreadOnly) q = q.eq('is_read', false);

  const { data, error, count } = await q;
  if (error) return { success: false, data: null, error: error.message };

  return {
    success: true,
    data: data as Message[],
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function markMessagesRead(ids: string[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false };

  await supabase
    .from('messages')
    .update({ is_read: true })
    .in('id', ids)
    .eq('user_id', user.id);

  return { success: true };
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  return count ?? 0;
}
