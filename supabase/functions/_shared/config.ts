const env = Deno.env.get('SMILE_ID_ENV') === 'production' ? 'live' : 'sandbox';

export const getSmileBaseUrl = () => {
  return env === 'live'
    ? 'https://api.smileidentity.com/v1'
    : 'https://testapi.smileidentity.com/v1';
};

export const SITE_URL = Deno.env.get('SITE_URL');

const SMILE_CALLBACK_URL = 'api/smile/webhook';

export const callbackUrl = `${SITE_URL}/${SMILE_CALLBACK_URL}`;
