import { safeStr } from '@/helpers/data.helpers';

export const SITE_URL = safeStr(process.env.SITE_URL);

export const RESEND_API_KEY = safeStr(process.env.RESEND_API_KEY);

export const RESEND_EMAIL_URL = 'https://api.resend.com/emails';

export const DEFAULT_EMAIL_SEND_FROM = 'HomeSphere <onboarding@resend.dev>';
export const SUPPORT_EMAIL = safeStr(
  process.env.SUPPORT_EMAIL,
  'hello@homesphere.com'
);

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

export const SMPSRMD = safeStr(process.env.ADMIN_WALLET_USER_ID);

export const baseClass = [
  'appearance-none',
  '[&::-webkit-inner-spin-button]:appearance-none',
  '[&::-webkit-outer-spin-button]:appearance-none',
  'border border-brand rounded-md',
  'w-full py-2 px-3 text-sm',
  'placeholder:text-gray-400',
  'outline-none',
  'focus:outline-none',
  'focus-visible:outline-none',
  'ring-0',
  'focus:ring-0',
  'focus-visible:!ring-0',
  'focus-visible:!ring-offset-0',
  'focus-visible:!ring-transparent',
  'shadow-none',
  'focus:shadow-none',
  'focus-visible:shadow-none',
  'focus:border-slate-500',
  'focus-visible:border-brand',
].join(' ');
