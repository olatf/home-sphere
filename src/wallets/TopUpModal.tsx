'use client';

import consola from 'consola';
import { CheckCircle2, CreditCard, Loader2, Wallet } from 'lucide-react';
import { useState } from 'react';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandInput, type FormValue } from '@/components/common/BrandInput';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PAYSTACK_PUBLIC_KEY } from '@/config/constants';
import { formatCurrency } from '@/helpers/currency.helpers';
import { getErrorMessage } from '@/helpers/error.helpers';
import { useInvalidateWallet } from '@/hooks/Useinvalidatewallet';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

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

const QUICK_AMOUNTS = [
  50000, 100000, 200000, 500000, 1000000, 1500000, 2000000,
];

export function TopUpModal({ isOpen, onClose, userEmail }: TopUpModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [dialogHidden, setDialogHidden] = useState(false);
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');

  const { invalidate } = useInvalidateWallet();

  const numericAmount = parseFloat(amount);
  const isValid = !Number.isNaN(numericAmount) && numericAmount >= 100;

  function handleOpenChange(open: boolean) {
    if (!open && !dialogHidden) {
      setStep('input');
      setAmount('');
      setError('');
      onClose();
    }
  }

  async function handleTopUp() {
    if (!isValid) return;
    setError('');
    setStep('processing');

    try {
      const [, data] = await Promise.all([
        loadPaystackScript(),
        fetch('/api/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: numericAmount }),
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
        amount: numericAmount * 100,
        ref: data.reference,
        access_code: data.access_code,
        onClose() {
          setDialogHidden(false);
          setStep('input');
        },
        callback(response: PaystackResponse) {
          fetch('/api/paystack/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: response.reference }),
          }).then(verifyRes => {
            if (verifyRes.ok) {
              setDialogHidden(false);
              setStep('success');
              invalidate();
              setTimeout(() => {
                setStep('input');
                setAmount('');
                onClose();
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
      setStep('input');
    }
  }
  if (dialogHidden) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-md rounded-2xl p-0 font-secondary">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
            <DialogTitle className="font-semibold text-gray-900 text-lg">
              Top Up Wallet
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5 p-6">
          {step === 'success' ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-500" />
              <p className="font-semibold text-gray-800 text-lg">
                Wallet Topped Up!
              </p>
              <p className="text-gray-500 text-sm">
                {formatCurrency(numericAmount)} has been added to your wallet.
              </p>
            </div>
          ) : (
            <>
              <div>
                <p className="mb-2 font-medium text-gray-600 text-sm">
                  Quick amounts
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map(a => (
                    <BrandButton
                      key={a}
                      onClick={() => setAmount(String(a))}
                      className={`rounded-lg border px-3 py-1.5 font-medium text-sm transition ${
                        amount === String(a)
                          ? 'border-emerald-500 bg-brand-dark text-white'
                          : 'border-gray-200 text-gray-600 hover:border-brand-light'
                      }`}
                    >
                      {formatCurrency(a)}
                    </BrandButton>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1.5 block font-medium font-secondary text-gray-700 text-sm">
                  Amount (₦)
                </div>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 font-medium text-gray-400">
                    ₦
                  </span>
                  <BrandInput
                    type="number"
                    name="amount"
                    min={100}
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(value: FormValue) => {
                      const rawValue = value?.toString() ?? '';
                      setAmount(rawValue);
                    }}
                  />
                </div>
                <p className="mt-1 text-gray-400 text-xs">
                  Minimum top-up: ₦100
                </p>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-red-600 text-sm">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3">
                <CreditCard className="h-4 w-4 shrink-0 text-gray-400" />
                <p className="text-gray-500 text-xs">
                  Secure payment via Paystack — card, bank transfer, or USSD
                  accepted.
                </p>
              </div>

              <BrandButton
                onClick={handleTopUp}
                disabled={!isValid || step === 'processing'}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 font-semibold text-sm text-white transition hover:bg-brand-dark/80 disabled:cursor-not-allowed disabled:opacity-50"
                leftIcon={<Loader2 className="h-4 w-4 animate-spin" />}
              >
                {step === 'processing' ? (
                  <>Opening payment...</>
                ) : (
                  `Top Up ${isValid ? formatCurrency(numericAmount) : '₦0'}`
                )}
              </BrandButton>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
