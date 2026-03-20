'use client';

import { useReducer, useEffect, useCallback } from 'react';
import { ArrowUp, Loader2, CheckCircle2, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUserWallet } from '@/hooks/useWallet';
import { useInvalidateWallet } from '@/hooks/Useinvalidatewallet';
import { usePinGuard } from '@/hooks/usePinGuard';
import { formatCurrency } from '@/helpers/currency.helpers';
import { getErrorMessage } from '@/helpers/error.helpers';

interface Bank {
  name: string;
  code: string;
}

type Step = 'input' | 'verifying' | 'submitting' | 'success';

interface State {
  amount: string;
  bankCode: string;
  bankSearch: string;
  banks: Bank[];
  filteredBanks: Bank[];
  showBankDropdown: boolean;
  accountNumber: string;
  accountName: string;
  step: Step;
  error: string;
}

type Action =
  | { type: 'SET_AMOUNT'; payload: string }
  | { type: 'SET_BANK'; payload: { code: string; name: string } }
  | { type: 'SET_BANK_SEARCH'; payload: string }
  | { type: 'SET_BANKS'; payload: Bank[] }
  | { type: 'SET_FILTERED_BANKS'; payload: Bank[] }
  | { type: 'SET_SHOW_BANK_DROPDOWN'; payload: boolean }
  | { type: 'SET_ACCOUNT_NUMBER'; payload: string }
  | { type: 'SET_ACCOUNT_NAME'; payload: string }
  | { type: 'SET_STEP'; payload: Step }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };

const initialState: State = {
  amount: '',
  bankCode: '',
  bankSearch: '',
  banks: [],
  filteredBanks: [],
  showBankDropdown: false,
  accountNumber: '',
  accountName: '',
  step: 'input',
  error: '',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_AMOUNT':
      return { ...state, amount: action.payload };
    case 'SET_BANK':
      return {
        ...state,
        bankCode: action.payload.code,
        bankSearch: action.payload.name,
        showBankDropdown: false,
      };
    case 'SET_BANK_SEARCH':
      return {
        ...state,
        bankSearch: action.payload,
        bankCode: '',
        showBankDropdown: true,
      };
    case 'SET_BANKS':
      return { ...state, banks: action.payload, filteredBanks: action.payload };
    case 'SET_FILTERED_BANKS':
      return { ...state, filteredBanks: action.payload };
    case 'SET_SHOW_BANK_DROPDOWN':
      return { ...state, showBankDropdown: action.payload };
    case 'SET_ACCOUNT_NUMBER':
      return { ...state, accountNumber: action.payload, accountName: '' };
    case 'SET_ACCOUNT_NAME':
      return { ...state, accountName: action.payload };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      // Preserve banks list — no need to refetch on every open
      return {
        ...initialState,
        banks: state.banks,
        filteredBanks: state.banks,
      };
    default:
      return state;
  }
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const { wallet } = useUserWallet();
  const { invalidate } = useInvalidateWallet();
  const { guardWithPin, PinModal } = usePinGuard();
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    amount,
    bankCode,
    bankSearch,
    banks,
    filteredBanks,
    showBankDropdown,
    accountNumber,
    accountName,
    step,
    error,
  } = state;

  const numericAmount = parseFloat(amount);
  const balance = wallet?.balance ?? 0;
  const isAmountValid =
    !isNaN(numericAmount) && numericAmount >= 100 && numericAmount <= balance;
  const canSubmit =
    isAmountValid && bankCode && accountNumber.length === 10 && accountName;

  useEffect(() => {
    if (!isOpen || banks.length > 0) return;
    fetch('/api/wallet/banks')
      .then(r => r.json())
      .then(d => dispatch({ type: 'SET_BANKS', payload: d.banks ?? [] }));
  }, [isOpen, banks.length]);

  // Filter banks on search
  useEffect(() => {
    dispatch({
      type: 'SET_FILTERED_BANKS',
      payload: !bankSearch
        ? banks
        : banks.filter(b =>
            b.name.toLowerCase().includes(bankSearch.toLowerCase())
          ),
    });
  }, [bankSearch, banks]);

  // Auto-verify account
  const verifyAccount = useCallback(async () => {
    if (accountNumber.length !== 10 || !bankCode) return;
    dispatch({ type: 'SET_STEP', payload: 'verifying' });
    dispatch({ type: 'SET_ERROR', payload: '' });
    try {
      const res = await fetch(
        `/api/wallet/verify-account?account_number=${accountNumber}&bank_code=${bankCode}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      dispatch({ type: 'SET_ACCOUNT_NAME', payload: data.account_name });
      dispatch({ type: 'SET_STEP', payload: 'input' });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(err) });
      dispatch({ type: 'SET_STEP', payload: 'input' });
    }
  }, [accountNumber, bankCode]);

  useEffect(() => {
    verifyAccount();
  }, [verifyAccount]);

  function handleOpenChange(open: boolean) {
    if (!open) {
      dispatch({ type: 'RESET' });
      onClose();
    }
  }

  async function executeWithdraw() {
    dispatch({ type: 'SET_ERROR', payload: '' });
    dispatch({ type: 'SET_STEP', payload: 'submitting' });
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          bank_code: bankCode,
          account_number: accountNumber,
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
      dispatch({ type: 'SET_ERROR', payload: getErrorMessage(err) });
      dispatch({ type: 'SET_STEP', payload: 'input' });
    }
  }

  function handleWithdrawClick() {
    if (!canSubmit) return;
    guardWithPin({
      title: 'Confirm Withdrawal',
      subtitle: `Enter your PIN to withdraw ${formatCurrency(numericAmount)} to ${accountName}.`,
      onVerified: executeWithdraw,
    });
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full max-w-md rounded-2xl p-0">
          <DialogHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-emerald-600" />
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Withdraw Funds
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 p-6">
            {step === 'success' ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                <p className="text-lg font-semibold text-gray-800">
                  Withdrawal Initiated!
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(numericAmount)} is being transferred to{' '}
                  {accountName}.
                  <br />
                  This may take up to 24 hours.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-xl bg-emerald-50 px-4 py-3">
                  <p className="text-xs text-emerald-700">Available Balance</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {formatCurrency(balance)}
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Amount (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
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
                      className="focus:border-brand-light/50 focus:ring-brand-light/50 w-full rounded-xl border border-gray-200 py-3 pr-4 pl-7 focus:ring-2 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                  {numericAmount > balance && (
                    <p className="mt-1 text-xs text-red-500">
                      Amount exceeds available balance
                    </p>
                  )}
                </div>

                <div className="relative">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Bank
                  </label>
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bank..."
                      value={
                        bankCode
                          ? (banks.find(b => b.code === bankCode)?.name ??
                            bankSearch)
                          : bankSearch
                      }
                      onChange={e =>
                        dispatch({
                          type: 'SET_BANK_SEARCH',
                          payload: e.target.value,
                        })
                      }
                      onFocus={() =>
                        dispatch({
                          type: 'SET_SHOW_BANK_DROPDOWN',
                          payload: true,
                        })
                      }
                      className="focus:border-brand-light/50 focus:ring-brand-light/50 w-full rounded-xl border border-gray-200 py-3 pr-4 pl-9 focus:ring-2 focus:outline-none"
                    />
                  </div>
                  {showBankDropdown &&
                    filteredBanks.length > 0 &&
                    !bankCode && (
                      <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg">
                        {filteredBanks.slice(0, 20).map(b => (
                          <li
                            key={b.code}
                            onClick={() =>
                              dispatch({
                                type: 'SET_BANK',
                                payload: { code: b.code, name: b.name },
                              })
                            }
                            className="cursor-pointer px-4 py-2.5 text-sm transition hover:bg-emerald-50"
                          >
                            {b.name}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Account Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="10-digit account number"
                    value={accountNumber}
                    onChange={e =>
                      dispatch({
                        type: 'SET_ACCOUNT_NUMBER',
                        payload: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    className="focus:border-brand-light/50 focus:ring-brand-light/50 w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:outline-none"
                  />
                  {step === 'verifying' && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <Loader2 className="h-3 w-3 animate-spin" /> Verifying
                      account...
                    </p>
                  )}
                  {accountName && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" /> {accountName}
                    </p>
                  )}
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleWithdrawClick}
                  disabled={!canSubmit || step === 'submitting'}
                  className="hover:bg-brand-dark/80 bg-brand flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {step === 'submitting' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    `Withdraw ${isAmountValid ? formatCurrency(numericAmount) : ''}`
                  )}
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {PinModal}
    </>
  );
}
