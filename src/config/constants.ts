import { safeStr } from '@/helpers/data.helpers';

export const SITE_URL = safeStr(process.env.SITE_URL);

export const RESEND_API_KEY = safeStr(process.env.RESEND_API_KEY);

export const RESEND_EMAIL_URL = 'https://api.resend.com/emails';

export const SideDisplayMedia: Array<{ src: string; alt: string }> = [
  {
    src: '/images/house_1.webp',
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
    src: '/images/house_4.webp',
    alt: 'Real estate houses',
  },
  {
    src: '/images/house_5.webp',
    alt: 'Real estate houses',
  },
];
