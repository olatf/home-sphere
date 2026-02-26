import { safeStr } from '@/helpers/data.helpers';

export const SITE_URL = safeStr(process.env.SITE_URL);

export const RESEND_API_KEY = safeStr(process.env.RESEND_API_KEY);

export const RESEND_EMAIL_URL = 'https://api.resend.com/emails';

export const SideDisplayMedia: Array<{ src: string; alt: string }> = [
  {
    src: '/images/house_11.webp',
    alt: 'Real estate houses',
  },
  {
    src: '/images/house_2.webp',
    alt: 'Real estate houses',
  },
  {
    src: '/images/house_3.webp',
    alt: 'Real estate houses',
  },
  {
    src: '/images/house_8.webp',
    alt: 'Real estate houses',
  },
  {
    src: '/images/house_9.webp',
    alt: 'Real estate houses',
  },
];
