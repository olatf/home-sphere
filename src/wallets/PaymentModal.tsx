'use client';

import consola from 'consola';
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { Fragment, useState } from 'react';
import { bookInspection, payForProperty } from '@/actions/tenancy';
import { BrandButton } from '@/components/common/BrandButton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PAYSTACK_PUBLIC_KEY } from '@/config/constants';
import { formatCurrency } from '@/helpers/currency.helpers';
import { getErrorMessage } from '@/helpers/error.helpers';
import { useInvalidateWallet } from '@/hooks/Useinvalidatewallet';
import { usePinGuard } from '@/hooks/usePinGuard';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import { useUserWallet } from '@/hooks/useWallet';
import { usePaymentStore } from '@/stores/paymentStore';
import type { PropertyType } from '@/types/property';

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
  callback: (r: PaystackResponse) => void;
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
        reject(new Error('Paystack load failed'))
      );
      return;
    }
    const script = document.createElement('script');
    script.src = PAYSTACK_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Paystack load failed'));
    document.body.appendChild(script);
  });
}

type PayMethod = 'wallet' | 'card';

export function PaymentModal({
  userEmail,
}: {
  userEmail: string;
  property?: unknown;
  type?: 'inspection' | 'payment';
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}) {
  const { isOpen, config, closePayment } = usePaymentStore();
  const { guardWithPin, PinModal } = usePinGuard();
  const { isFullyVerified, isLoading: verifying } = useVerificationStatus();
  const { wallet } = useUserWallet();
  const { invalidate } = useInvalidateWallet();

  const [method, setMethod] = useState<PayMethod>('wallet');
  const [step, setStep] = useState<'select' | 'processing' | 'success'>(
    'select'
  );
  const [error, setError] = useState('');
  const [dialogHidden, setDialogHidden] = useState(false);

  const balance = wallet?.balance ?? 0;
  const amount = config?.amount ?? 0;
  const hasEnoughBalance = balance >= amount;

  consola.log('PAYMENT AMOUNT:', amount);

  function reset() {
    setStep('select');
    setError('');
    setDialogHidden(false);
  }
  function handleClose() {
    config?.onCancel?.();
    reset();
    closePayment();
  }
  function handleOpenChange(open: boolean) {
    if (!open && !dialogHidden) handleClose();
  }

  // Property-flow payments always debit the wallet — card is not available
  const isInspectionPayment = config?.transactionType === 'inspection_payment';
  const isPurchasePayment =
    config?.transactionType === 'purchase_payment' ||
    config?.transactionType === 'rent_payment';
  const forceWallet = isInspectionPayment || isPurchasePayment;

  async function handleWalletPayment() {
    if (!config) return;
    setStep('processing');
    setError('');

    try {
      let reference = '';

      if (isInspectionPayment && config.metadata?.property_id) {
        const result = await bookInspection({
          property_id: config.metadata.property_id as string,
          preferred_date:
            (config.metadata.preferred_date as string) ??
            new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: config.metadata.notes as string | undefined,
          property_type: config.metadata.property_type as PropertyType,
        });

        if (!result.success)
          throw new Error(result.error ?? 'Inspection booking failed');

        reference = result.reference ?? '';
      } else if (isPurchasePayment && config.metadata?.property_id) {
        const result = await payForProperty({
          property_id: config.metadata.property_id as string,
          listing_type:
            (config.metadata.listing_type as 'rent' | 'lease' | 'sale') ??
            'rent',
          duration_years: Number(config.metadata.duration_years ?? 0),
          payment_plan:
            (config.metadata.payment_plan as 'full' | 'instalment') ?? 'full',
          legal_services_opted: Boolean(
            config.metadata.legal_services_opted ?? false
          ),
          inspection_id: config.metadata.inspection_id as string,
          initial_payment_percent: config.metadata.initial_payment_percent
            ? Number(config.metadata.initial_payment_percent)
            : undefined,
        });
        if (!result.success) throw new Error(result.error ?? 'Payment failed');
        reference = result.reference ?? '';
      } else {
        // Generic wallet-to-wallet (top-ups, rent renewals, etc.)
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
        reference = data.reference;
      }

      setStep('success');
      await invalidate();
      await config.onSuccess?.(reference);
      setTimeout(() => {
        reset();
        closePayment();
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err));
      setStep('select');
    }
  }

  // Card payment (generic payments only)

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
              await invalidate();
              await config.onSuccess?.(response.reference);
              setTimeout(() => {
                reset();
                closePayment();
              }, 2000);
            }
          });
        },
      });

      handler.openIframe();
    } catch (err) {
      const msg = getErrorMessage(err);
      consola.error(msg);
      setError(msg);
      setDialogHidden(false);
      setStep('select');
    }
  }

  function handleTransfer() {
    if (!amount || !forceWallet) return;
    guardWithPin({
      title: 'Confirm Transfer',
      subtitle: `Enter your PIN to complete your transfer of ${formatCurrency(amount)} for ${config.description} .`,
      onVerified: handleWalletPayment,
    });
  }

  // Guards

  if (!config) return null;
  if (dialogHidden) return null;
  if (!isFullyVerified || verifying) return null;

  return (
    <Fragment>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full max-w-md rounded-2xl p-0">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="font-primary font-semibold text-gray-900 text-lg">
              {config.label}
            </DialogTitle>
            <DialogDescription className="mt-0.5 font-secondary text-gray-400 text-xs">
              {config.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 p-6">
            {step === 'success' ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                <p className="font-primary font-semibold text-gray-800 text-lg">
                  Payment Successful!
                </p>
                <p className="font-secondary text-gray-500 text-sm">
                  {formatCurrency(amount)} paid successfully.
                </p>
              </div>
            ) : (
              <>
                {/* Amount */}
                <div className="rounded-xl bg-gray-50 px-5 py-4 text-center font-secondary">
                  <p className="mb-1 text-gray-500 text-xs">Amount Due</p>
                  <p className="font-bold font-primary text-3xl text-gray-900">
                    {formatCurrency(amount)}
                  </p>
                </div>

                {/* Payment method */}
                {forceWallet ? (
                  <div className="flex items-center justify-between rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-brand" />
                      <div>
                        <p className="font-primary font-semibold text-gray-800 text-sm">
                          HomeSphere Wallet
                        </p>
                        <p className="font-secondary text-gray-500 text-xs">
                          Balance: {formatCurrency(balance)}
                        </p>
                      </div>
                    </div>
                    {!hasEnoughBalance && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium font-secondary text-red-600 text-xs">
                        Low balance
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="mb-2 font-medium text-gray-700 text-sm">
                      Pay with
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {(['wallet', 'card'] as PayMethod[]).map(m => (
                        <BrandButton
                          key={m}
                          onClick={() => setMethod(m)}
                          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 font-secondary transition ${
                            method === m
                              ? 'border-brand bg-brand/5'
                              : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          {m === 'wallet' ? (
                            <Wallet
                              className={`h-6 w-6 ${method === 'wallet' ? 'text-brand' : 'text-gray-400'}`}
                            />
                          ) : (
                            <CreditCard
                              className={`h-6 w-6 ${method === 'card' ? 'text-brand' : 'text-gray-400'}`}
                            />
                          )}
                          <div className="text-center">
                            <p
                              className={`font-medium text-sm ${method === m ? 'text-brand' : 'text-gray-700'}`}
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
                              <p className="mt-0.5 text-gray-400 text-xs">
                                Via Paystack
                              </p>
                            )}
                          </div>
                        </BrandButton>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insufficient balance warning */}
                {!hasEnoughBalance && (forceWallet || method === 'wallet') && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 font-secondary text-amber-700 text-sm">
                    Insufficient wallet balance. Please top up your wallet
                    {!forceWallet ? ' or pay by card' : ''}.
                  </p>
                )}

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 font-secondary text-red-600 text-sm">
                    {error}
                  </p>
                )}

                {/* Security */}
                <div className="flex items-center gap-2 font-secondary text-gray-400 text-xs">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>256-bit encrypted. Secured by Paystack.</span>
                </div>

                {/* CTA */}
                <BrandButton
                  onClick={() =>
                    forceWallet || method === 'wallet'
                      ? handleTransfer()
                      : handleCardPayment()
                  }
                  disabled={
                    step === 'processing' ||
                    (forceWallet && !hasEnoughBalance) ||
                    (!forceWallet && method === 'wallet' && !hasEnoughBalance)
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 font-semibold text-sm text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {step === 'processing' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    `Pay ${formatCurrency(amount)}`
                  )}
                </BrandButton>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {PinModal}
    </Fragment>
  );
}
