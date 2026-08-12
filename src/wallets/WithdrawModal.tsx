'use client';

import { ArrowUp, CheckCircle2, Loader2, Search } from 'lucide-react';
import { useCallback, useEffect, useReducer } from 'react';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandInput, type FormValue } from '@/components/common/BrandInput';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/helpers/currency.helpers';
import { getErrorMessage } from '@/helpers/error.helpers';
import { useInvalidateWallet } from '@/hooks/Useinvalidatewallet';
import { usePinGuard } from '@/hooks/usePinGuard';
import { useRovingTabIndex } from '@/hooks/useRovingTabIndex';
import { useUserWallet } from '@/hooks/useWallet';

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

  const selectBank = useCallback(
    (index: number) => {
      const bank = filteredBanks[index];
      if (bank) dispatch({ type: 'SET_BANK', payload: bank });
    },
    [filteredBanks]
  );

  const bankList = useRovingTabIndex({
    itemCount: Math.min(filteredBanks.length, 20),
    onSelect: selectBank,
  });

  const isAmountValid =
    !Number.isNaN(numericAmount) &&
    numericAmount >= 100 &&
    numericAmount <= balance;
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
              <DialogTitle className="font-semibold text-gray-900 text-lg">
                Withdraw Funds
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 p-6">
            {step === 'success' ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                <p className="font-semibold text-gray-800 text-lg">
                  Withdrawal Initiated!
                </p>
                <p className="text-gray-500 text-sm">
                  {formatCurrency(numericAmount)} is being transferred to{' '}
                  {accountName}.
                  <br />
                  This may take up to 24 hours.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-xl bg-emerald-50 px-4 py-3">
                  <p className="text-emerald-700 text-xs">Available Balance</p>
                  <p className="font-bold text-emerald-700 text-xl">
                    {formatCurrency(balance)}
                  </p>
                </div>

                <div>
                  <div className="mb-1.5 block font-medium text-gray-700 text-sm">
                    Amount (₦)
                  </div>
                  <div className="relative">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
                      ₦
                    </span>
                    <BrandInput
                      name="amount"
                      type="number"
                      min={100}
                      max={balance}
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(value: FormValue) => {
                        const rawValue = value?.toString() ?? '';
                        dispatch({
                          type: 'SET_AMOUNT',
                          payload: rawValue,
                        });
                      }}
                    />
                  </div>
                  {numericAmount > balance && (
                    <p className="mt-1 text-red-500 text-xs">
                      Amount exceeds available balance
                    </p>
                  )}
                </div>

                <div className="relative">
                  <div className="mb-1.5 block font-medium text-gray-700 text-sm">
                    Bank
                  </div>
                  <div className="relative">
                    <BrandInput
                      type="text"
                      name="bank"
                      placeholder="Search bank..."
                      value={
                        bankCode
                          ? (banks.find(b => b.code === bankCode)?.name ??
                            bankSearch)
                          : bankSearch
                      }
                      onChange={(value: FormValue) => {
                        const rawValue = value?.toString() ?? '';
                        dispatch({
                          type: 'SET_BANK_SEARCH',
                          payload: rawValue,
                        });
                      }}
                      onFocus={() =>
                        dispatch({
                          type: 'SET_SHOW_BANK_DROPDOWN',
                          payload: true,
                        })
                      }
                      onKeyDown={e => {
                        if (
                          e.key === 'ArrowDown' &&
                          showBankDropdown &&
                          filteredBanks.length > 0
                        ) {
                          e.preventDefault();
                          bankList.focusItem(0);
                        }
                      }}
                      leftElement={<Search className="size-4" />}
                    />
                  </div>
                  {showBankDropdown &&
                    filteredBanks.length > 0 &&
                    !bankCode && (
                      <ul
                        // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: <ul>/<li> is the standard WAI-ARIA listbox/option pairing
                        role="listbox"
                        aria-label="Select bank"
                        onKeyDown={bankList.handleKeyDown}
                        className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg"
                      >
                        {filteredBanks.slice(0, 20).map((b, i) => {
                          const itemProps = bankList.getItemProps(i);
                          return (
                            // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation is handled by the roving-tabindex listbox (onKeyDown on the ul above)
                            <li
                              key={b.code}
                              ref={itemProps.ref}
                              tabIndex={itemProps.tabIndex}
                              onFocus={itemProps.onFocus}
                              // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: <ul>/<li> is the standard WAI-ARIA listbox/option pairing
                              role="option"
                              aria-selected={bankCode === b.code}
                              onClick={() => selectBank(i)}
                              className="cursor-pointer px-4 py-2.5 text-sm outline-none transition hover:bg-emerald-50 focus:bg-emerald-50"
                            >
                              {b.name}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                </div>

                <div>
                  <BrandInput
                    name="accountNumber"
                    type="text"
                    label="Account Number"
                    maxLength={10}
                    placeholder="10-digit account number"
                    value={accountNumber}
                    onChange={(value: FormValue) => {
                      const rawValue = value?.toString() ?? '';
                      dispatch({
                        type: 'SET_ACCOUNT_NUMBER',
                        payload: rawValue.replace(/\D/g, ''),
                      });
                    }}
                  />
                  {step === 'verifying' && (
                    <p className="mt-1 flex items-center gap-1 text-gray-400 text-xs">
                      <Loader2 className="h-3 w-3 animate-spin" /> Verifying
                      account...
                    </p>
                  )}
                  {accountName && (
                    <p className="mt-1 flex items-center gap-1 font-medium text-emerald-600 text-xs">
                      <CheckCircle2 className="h-3 w-3" /> {accountName}
                    </p>
                  )}
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-red-600 text-sm">
                    {error}
                  </p>
                )}

                <BrandButton
                  onClick={handleWithdrawClick}
                  disabled={!canSubmit || step === 'submitting'}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 font-semibold text-sm text-white transition hover:bg-brand-dark/80 disabled:cursor-not-allowed disabled:opacity-50"
                  leftIcon={
                    step === 'submitting' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null
                  }
                >
                  {step === 'submitting' ? (
                    <span> Processing...</span>
                  ) : (
                    `Withdraw ${isAmountValid ? formatCurrency(numericAmount) : ''}`
                  )}
                </BrandButton>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {PinModal}
    </>
  );
}
