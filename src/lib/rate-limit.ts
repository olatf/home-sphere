import 'server-only';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return headerList.get('x-real-ip') ?? 'unknown';
}

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const admin = await createAdminClient();

  const { data, error } = await admin.rpc('check_rate_limit', {
    p_key: key,
    p_max_requests: maxRequests,
    p_window_seconds: windowSeconds,
  });

  if (error) return true;

  return Boolean(data);
}

export async function rateLimitByIp(
  scope: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  const ip = await getClientIp();
  return checkRateLimit(`${scope}:${ip}`, maxRequests, windowSeconds);
}

export async function rateLimitByUser(
  scope: string,
  userId: string,
  maxRequests: number,
  windowSeconds: number
): Promise<boolean> {
  return checkRateLimit(`${scope}:${userId}`, maxRequests, windowSeconds);
}
