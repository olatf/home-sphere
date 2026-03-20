'use client';

import { useReducer, useRef, useEffect } from 'react';
import {
  Send,
  Search,
  Loader2,
  CheckCircle2,
  X,
  ArrowRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { safeStr } from '@/helpers/data.helpers';
import { useUserWallet } from '@/hooks/useWallet';
import { useInvalidateWallet } from '@/hooks/Useinvalidatewallet';
import { usePinGuard } from '@/hooks/usePinGuard';
import { formatCurrency } from '@/helpers/currency.helpers';
import { BrandAvatar } from '@/components/common/BrandAvatar';
import { getErrorMessage } from '@/helpers/error.helpers';
import consola from 'consola';

interface Recipient {
  wallet_id: string;
  display_wallet_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

type Step = 'lookup' | 'amount' | 'processing' | 'success';

interface State {
  step: Step;
  query: string;
  recipient: Recipient | null;
  lookupLoading: boolean;
  lookupError: string;
  amount: string;
  note: string;
  transferError: string;
}

type Action =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_LOOKUP_LOADING'; payload: boolean }
  | { type: 'SET_LOOKUP_ERROR'; payload: string }
  | { type: 'SET_RECIPIENT'; payload: Recipient | null }
  | { type: 'SET_AMOUNT'; payload: string }
  | { type: 'SET_NOTE'; payload: string }
  | { type: 'SET_STEP'; payload: Step }
  | { type: 'SET_TRANSFER_ERROR'; payload: string }
  | { type: 'CLEAR_RECIPIENT' }
  | { type: 'RESET' };

const initialState: State = {
  step: 'lookup',
  query: '',
  recipient: null,
  lookupLoading: false,
  lookupError: '',
  amount: '',
  note: '',
  transferError: '',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload, lookupError: '' };
    case 'SET_LOOKUP_LOADING':
      return { ...state, lookupLoading: action.payload };
    case 'SET_LOOKUP_ERROR':
      return { ...state, lookupError: action.payload, lookupLoading: false };
    case 'SET_RECIPIENT':
      return { ...state, recipient: action.payload, lookupLoading: false };
    case 'SET_AMOUNT':
      return { ...state, amount: action.payload };
    case 'SET_NOTE':
      return { ...state, note: action.payload };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_TRANSFER_ERROR':
      return { ...state, transferError: action.payload };
    case 'CLEAR_RECIPIENT':
      return { ...state, recipient: null, query: '' };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function RecipientAvatar({ recipient }: { recipient: Recipient }) {
  return (
    <BrandAvatar
      size={48}
      value={recipient.name}
      src={safeStr(recipient.avatar_url)}
    />
  );
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const { wallet } = useUserWallet();
  const { invalidate } = useInvalidateWallet();
  const { guardWithPin, PinModal } = usePinGuard();
  const [state, dispatch] = useReducer(reducer, initialState);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    step,
    query,
    recipient,
    lookupLoading,
    lookupError,
    amount,
    note,
    transferError,
  } = state;

  const balance = wallet?.balance ?? 0;
  const numericAmount = parseFloat(amount);
  const isAmountValid =
    !isNaN(numericAmount) && numericAmount >= 100 && numericAmount <= balance;

  // Debounced recipient lookup
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      dispatch({ type: 'SET_RECIPIENT', payload: null });
      return;
    }
    debounceRef.current = setTimeout(async () => {
      dispatch({ type: 'SET_LOOKUP_LOADING', payload: true });
      dispatch({ type: 'SET_RECIPIENT', payload: null });
      try {
        const res = await fetch(
          `/api/wallet/recipient?q=${encodeURIComponent(trimmed)}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        dispatch({ type: 'SET_RECIPIENT', payload: data });
      } catch (err) {
        dispatch({ type: 'SET_LOOKUP_ERROR', payload: getErrorMessage(err) });
      }
    }, 600);
  }, [query]);

  function handleOpenChange(open: boolean) {
    if (!open) {
      dispatch({ type: 'RESET' });
      onClose();
    }
  }

  async function executeTransfer() {
    if (!recipient || !isAmountValid) return;
    dispatch({ type: 'SET_STEP', payload: 'processing' });
    dispatch({ type: 'SET_TRANSFER_ERROR', payload: '' });
    try {
      const res = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverWalletId: recipient.wallet_id,
          amount: numericAmount,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      dispatch({ type: 'SET_STEP', payload: 'success' });
      await invalidate();
      setTimeout(() => {
        dispatch({ type: 'RESET' });
        onClose();
      }, 2500);
    } catch (err) {
      const errMessage = getErrorMessage(err);
      consola.error(errMessage);
      dispatch({ type: 'SET_TRANSFER_ERROR', payload: errMessage });
      dispatch({ type: 'SET_STEP', payload: 'amount' });
    }
  }

  function handleTransfer() {
    if (!isAmountValid || !recipient) return;
    guardWithPin({
      title: 'Confirm Transfer',
      subtitle: `Enter your PIN to send ${formatCurrency(numericAmount)} to ${recipient.name}.`,
      onVerified: executeTransfer,
    });
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full max-w-md rounded-2xl p-0">
          <DialogHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-emerald-600" />
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Transfer Funds
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="p-6">
            {step === 'success' && recipient && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                <p className="text-lg font-semibold text-gray-800">
                  Transfer Successful!
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(numericAmount)} sent to{' '}
                  <span className="font-medium text-gray-700">
                    {recipient.name}
                  </span>
                  .
                </p>
              </div>
            )}

            {step === 'processing' && (
              <div className="flex flex-col items-center gap-3 py-10">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                <p className="text-sm text-gray-500">Processing transfer...</p>
              </div>
            )}

            {step === 'lookup' && (
              <div className="space-y-5">
                <div className="rounded-xl bg-emerald-50 px-4 py-3">
                  <p className="text-xs text-emerald-700">Available Balance</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {formatCurrency(balance)}
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Wallet ID or Email
                  </label>
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. HMS-B6BA7F9E or user@email.com"
                      value={query}
                      onChange={e =>
                        dispatch({ type: 'SET_QUERY', payload: e.target.value })
                      }
                      className="focus:border-brand-light/50 focus:ring-brand-light/50 w-full rounded-xl border border-gray-200 py-3 pr-4 pl-9 text-sm focus:ring-2 focus:outline-none"
                    />
                    {lookupLoading && (
                      <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Enter at least 3 characters to search.
                  </p>
                </div>

                {lookupError && !lookupLoading && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {lookupError}
                  </p>
                )}

                {recipient && (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <RecipientAvatar recipient={recipient} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {recipient.name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {recipient.email}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-emerald-600">
                        {recipient.display_wallet_id}
                      </p>
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'CLEAR_RECIPIENT' })}
                      className="rounded-full p-1 text-gray-400 transition hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (recipient)
                      dispatch({ type: 'SET_STEP', payload: 'amount' });
                  }}
                  disabled={!recipient}
                  className="hover:bg-brand-dark/80 bg-brand flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === 'amount' && recipient && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                  <RecipientAvatar recipient={recipient} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {recipient.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {recipient.display_wallet_id}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      dispatch({ type: 'SET_STEP', payload: 'lookup' })
                    }
                    className="text-brand text-xs hover:underline"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Amount (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 font-medium text-gray-400">
                      ₦
                    </span>
                    <input
                      type="number"
                      min={100}
                      max={balance}
                      placeholder="Enter amount"
                      value={amount}
                      onChange={e =>
                        dispatch({
                          type: 'SET_AMOUNT',
                          payload: e.target.value,
                        })
                      }
                      className="focus:border-brand-light/50 focus:ring-brand-light/50 w-full rounded-xl border border-gray-200 py-3 pr-4 pl-7 text-base focus:ring-2 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Minimum: ₦100</p>
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'SET_AMOUNT',
                          payload: String(balance),
                        })
                      }
                      className="text-xs text-emerald-600 hover:underline"
                    >
                      Send max ({formatCurrency(balance)})
                    </button>
                  </div>
                  {numericAmount > balance && (
                    <p className="mt-1 text-xs text-red-500">
                      Amount exceeds available balance
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Note{' '}
                    <span className="font-normal text-gray-400">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Rent for March"
                    value={note}
                    onChange={e =>
                      dispatch({ type: 'SET_NOTE', payload: e.target.value })
                    }
                    className="focus:border-brand-light/50 focus:ring-brand-light/50 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:outline-none"
                  />
                </div>

                {transferError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {transferError}
                  </p>
                )}

                <button
                  onClick={handleTransfer}
                  disabled={!isAmountValid}
                  className="hover:bg-brand-dark/80 bg-brand flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Send {isAmountValid ? formatCurrency(numericAmount) : ''}
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {PinModal}
    </>
  );
}
