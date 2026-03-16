import { safeStr } from '@/helpers/data.helpers';

export const SITE_URL = safeStr(process.env.SITE_URL);

export const RESEND_API_KEY = safeStr(process.env.RESEND_API_KEY);

export const RESEND_EMAIL_URL = 'https://api.resend.com/emails';

export const DEFAULT_EMAIL_SEND_FROM = 'HomeSphere <onboarding@resend.dev>';

const SMILE_CALLBACK_URL = safeStr(
  process.env.SMILE_ID_CALLBACK_URL,
  'api/smile/webhook'
);

export const SMILE_CALLBACK_URL_PATH = SITE_URL
  ? `${SITE_URL}/${SMILE_CALLBACK_URL}`
  : `/${SMILE_CALLBACK_URL}`;

export const SMILE_OS_ENV =
  process.env.SMILE_ID_ENV === 'production' ? 'live' : 'sandbox';
