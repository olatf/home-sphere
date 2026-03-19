import { safeStr } from '@/helpers/data.helpers';

export const SITE_URL = safeStr(process.env.SITE_URL);

export const RESEND_API_KEY = safeStr(process.env.RESEND_API_KEY);

export const RESEND_EMAIL_URL = 'https://api.resend.com/emails';

export const DEFAULT_EMAIL_SEND_FROM = 'HomeSphere <onboarding@resend.dev>';

export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
export const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL;
export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!;

const SMILE_CALLBACK_URL = safeStr(
  process.env.SMILE_ID_CALLBACK_URL,
  'api/smile/webhook'
);

export const PIN_LENGTH = 4 as const;
export const MAX_ATTEMPTS = 3 as const;

export const PAGE_SIZE = 6 as const;

export const SMILE_CALLBACK_URL_PATH = SITE_URL
  ? `${SITE_URL}/${SMILE_CALLBACK_URL}`
  : `/${SMILE_CALLBACK_URL}`;

export const SMILE_OS_ENV =
  process.env.SMILE_ID_ENV === 'production' ? 'live' : 'sandbox';
