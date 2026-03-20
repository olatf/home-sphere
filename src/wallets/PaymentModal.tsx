'use client';

import { useState } from 'react';
import {
  Wallet,
  CreditCard,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { usePaymentStore } from '@/stores/paymentStore';
import { useUserWallet } from '@/hooks/useWallet';
import { useInvalidateWallet } from '@/hooks/Useinvalidatewallet';
import { PAYSTACK_PUBLIC_KEY } from '@/config/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { getErrorMessage } from '@/helpers/error.helpers';
import { formatCurrency } from '@/helpers/currency.helpers';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import consola from 'consola';

interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  trxref: string;
}

interface PaystackHandler {
  openIframe: () => void;
}

interface PaystackSetupConfig {
  key: string;
  email: string;
  amount: number;
  ref: string;
  access_code: string;
  onClose: () => void;
  callback: (response: PaystackResponse) => void;
}

interface PaystackPopType {
  setup: (config: PaystackSetupConfig) => PaystackHandler;
}

declare global {
  interface Window {
    PaystackPop: PaystackPopType;
  }
}

const PAYSTACK_SCRIPT_URL = 'https://js.paystack.co/v1/inline.js';

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PAYSTACK_SCRIPT_URL}"]`
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Paystack script failed to load'))
      );
      return;
    }
    const script = document.createElement('script');
    script.src = PAYSTACK_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Paystack script failed to load'));
    document.body.appendChild(script);
  });
}

type PayMethod = 'wallet' | 'card';

interface PaymentModalProps {
  userEmail: string;
}

export function PaymentModal({ userEmail }: PaymentModalProps) {
  const { isOpen, config, closePayment } = usePaymentStore();
  const { isFullyVerified, isLoading: verification } = useVerificationStatus();
  const { wallet } = useUserWallet();
  const { invalidate } = useInvalidateWallet();

  const [method, setMethod] = useState<PayMethod>('wallet');
  const [step, setStep] = useState<'select' | 'processing' | 'success'>(
    'select'
  );
  const [error, setError] = useState('');
  const [dialogHidden, setDialogHidden] = useState(false);

  const balance = wallet?.balance ?? 0;
  const hasEnoughBalance = balance >= (config?.amount ?? 0);

  function handleClose() {
    config?.onCancel?.();
    setStep('select');
    setError('');
    closePayment();
  }

  function handleOpenChange(open: boolean) {
    if (!open && !dialogHidden) handleClose();
  }

  async function handleWalletPayment() {
    if (!config) return;
    setStep('processing');
    setError('');
    try {
      const res = await fetch('/api/wallet/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: config.amount,
          transactionType: config.transactionType,
          receiverWalletId: config.receiverWalletId,
          description: config.description,
          metadata: config.metadata,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep('success');
      invalidate();
      await config.onSuccess?.(data.reference);
      setTimeout(() => {
        setStep('select');
        setError('');
        closePayment();
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err));
      setStep('select');
    }
  }

  async function handleCardPayment() {
    if (!config) return;
    setStep('processing');
    setError('');
    try {
      const [, data] = await Promise.all([
        loadPaystackScript(),
        fetch('/api/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: config.amount }),
        }).then(async res => {
          const json = await res.json();
          if (!res.ok) throw new Error(json.error);
          return json as { reference: string; access_code: string };
        }),
      ]);

      setDialogHidden(true);

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: userEmail,
        amount: config.amount * 100,
        ref: data.reference,
        access_code: data.access_code,
        onClose() {
          setDialogHidden(false);
          setStep('select');
        },
        callback(response: PaystackResponse) {
          fetch('/api/paystack/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: response.reference }),
          }).then(async verifyRes => {
            if (verifyRes.ok) {
              setDialogHidden(false);
              setStep('success');
              invalidate();
              await config.onSuccess?.(response.reference);
              setTimeout(() => {
                setStep('select');
                setError('');
                closePayment();
              }, 2000);
            }
          });
        },
      });

      handler.openIframe();
    } catch (err) {
      const errMessage = getErrorMessage(err);
      consola.error(errMessage);
      setError(errMessage);
      setDialogHidden(false);
      setStep('select');
    }
  }

  if (!config) return null;
  if (dialogHidden) return null;
  if (!isFullyVerified || verification) return;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-md rounded-2xl p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="font-primary text-lg font-semibold text-gray-900">
            {config.label}
          </DialogTitle>
          <DialogDescription className="font-secondary mt-0.5 text-xs text-gray-400">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 p-6">
          {step === 'success' ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-500" />
              <p className="font-secondary text-lg font-semibold text-gray-800">
                Payment Successful!
              </p>
              <p className="font-secondary text-sm text-gray-500">
                {formatCurrency(config.amount)} paid successfully.
              </p>
            </div>
          ) : (
            <>
              <div className="font-secondary rounded-xl bg-gray-50 px-5 py-4 text-center">
                <p className="mb-1 text-xs text-gray-500">Amount Due</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(config.amount)}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Pay with
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(['wallet', 'card'] as PayMethod[]).map(m => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`font-secondary flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                        method === m
                          ? 'border-brand-dark bg-brand-dark/10'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {m === 'wallet' ? (
                        <Wallet
                          className={`h-6 w-6 ${method === 'wallet' ? 'text-brand-dark' : 'text-gray-400'}`}
                        />
                      ) : (
                        <CreditCard
                          className={`h-6 w-6 ${method === 'card' ? 'text-brand-dark' : 'text-gray-400'}`}
                        />
                      )}
                      <div className="text-center">
                        <p
                          className={`text-sm font-medium ${method === m ? 'text-brand-dark' : 'text-gray-700'}`}
                        >
                          {m === 'wallet' ? 'Wallet' : 'Card'}
                        </p>
                        {m === 'wallet' ? (
                          <p
                            className={`mt-0.5 text-xs ${hasEnoughBalance ? 'text-gray-500' : 'text-red-400'}`}
                          >
                            {formatCurrency(balance)}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-xs text-gray-400">
                            Via Paystack
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {method === 'wallet' && !hasEnoughBalance && (
                <p className="font-secondary rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  Insufficient wallet balance. Please top up or pay by card.
                </p>
              )}

              {error && (
                <p className="font-secondary rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="font-secondary flex items-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>256-bit encrypted. Secured by Paystack.</span>
              </div>

              <button
                onClick={() =>
                  method === 'wallet'
                    ? handleWalletPayment()
                    : handleCardPayment()
                }
                disabled={
                  step === 'processing' ||
                  (method === 'wallet' && !hasEnoughBalance)
                }
                className="hover:bg-brand-dark/80 bg-brand flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {step === 'processing' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  `Pay ${formatCurrency(config.amount)}`
                )}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
