import { PAYSTACK_BASE_URL, PAYSTACK_SECRET_KEY } from '@/config/constants';

function getHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
}

export interface InitializeTransactionParams {
  email: string;
  amount: number; // in kobo (NGN * 100)
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
  channels?: (
    | 'card'
    | 'bank'
    | 'ussd'
    | 'qr'
    | 'mobile_money'
    | 'bank_transfer'
  )[];
}

export interface InitializeTransactionResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<InitializeTransactionResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      ...params,
      amount: Math.round(params.amount * 100),
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(
      error.message || 'Failed to initialize Paystack transaction'
    );
  }

  return res.json();
}

// Verify Transaction

export interface VerifyTransactionResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number; // in kobo
    currency: string;
    paid_at: string;
    channel: string;
    customer: {
      email: string;
      id: number;
    };
    metadata: Record<string, unknown>;
  };
}

export async function verifyTransaction(
  reference: string
): Promise<VerifyTransactionResponse> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to verify Paystack transaction');
  }

  return res.json();
}

// Create Transfer Recipient

export interface CreateRecipientParams {
  type: 'nuban';
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
}

export interface CreateRecipientResponse {
  status: boolean;
  message: string;
  data: {
    recipient_code: string;
    id: number;
    name: string;
    account_number: string;
  };
}

export async function createTransferRecipient(
  params: CreateRecipientParams
): Promise<CreateRecipientResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...params, currency: params.currency ?? 'NGN' }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create transfer recipient');
  }

  return res.json();
}

// Initiate Transfer (Payout)

export interface InitiateTransferParams {
  source: 'balance';
  amount: number; // in kobo
  recipient: string; // recipient_code
  reason?: string;
  reference?: string;
}

export interface InitiateTransferResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    status: string;
    transfer_code: string;
    amount: number;
  };
}

export async function initiateTransfer(
  params: InitiateTransferParams
): Promise<InitiateTransferResponse> {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      ...params,
      amount: Math.round(params.amount * 100),
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to initiate transfer');
  }

  return res.json();
}

// Verify Account Number

export interface VerifyAccountResponse {
  status: boolean;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}

export async function verifyAccountNumber(
  account_number: string,
  bank_code: string
): Promise<VerifyAccountResponse> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
    { method: 'GET', headers: getHeaders() }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to verify account number');
  }

  return res.json();
}

// List Banks

export interface Bank {
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string;
  active: boolean;
  country: string;
  currency: string;
  type: string;
}

export interface ListBanksResponse {
  status: boolean;
  message: string;
  data: Bank[];
}

export async function listBanks(
  country = 'nigeria'
): Promise<ListBanksResponse> {
  const res = await fetch(
    `${PAYSTACK_BASE_URL}/bank?country=${country}&perPage=100`,
    {
      method: 'GET',
      headers: getHeaders(),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to list banks');
  }

  return res.json();
}

// Helpers

export function generateReference(prefix = 'HMS'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount);
}
