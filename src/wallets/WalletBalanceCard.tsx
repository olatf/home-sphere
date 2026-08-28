'use client';

import { Check, Copy, EyeIcon, EyeOff } from 'lucide-react';
import { useState } from 'react';
import CountUp from 'react-countup';
import { toast } from 'sonner';
import { BrandButton } from '@/components/common/BrandButton';
import { formatCurrency } from '@/helpers/currency.helpers';
import { useUserWallet } from '@/hooks/useWallet';
import { SetWalletPin } from './SetWalletPin';
import { UpdateWalletPin } from './UpdateWalletPin';

export const WalletBalanceCard = () => {
  const [openSetPin, setOpenSetPin] = useState(false);
  const [openUpdatePin, setOpenUpdatePin] = useState(false);
  const [showBal, setShowBal] = useState(true);
  const [copied, setCopied] = useState(false);
  const { wallet, isLoading } = useUserWallet();

  const copyToClipboard = (walletId: string) => {
    navigator.clipboard.writeText(walletId);
    toast.success('Wallet ID copied to clipboard!');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!wallet || isLoading) return <SkeletonLoader />;

  const hasPin = wallet.hasSetPin ?? false;

  return (
    <>
      <div className="relative mx-2 mt-6 overflow-hidden rounded-3xl bg-linear-to-br from-brand via-brand-light to-brand-dark p-3 font-secondary text-white shadow-xl md:mx-6 md:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-80">Wallet Balance</p>

            <div className="mt-2 flex items-center gap-3">
              <h1 className="font-bold text-3xl tracking-tight md:text-4xl">
                {showBal ? (
                  <>
                    <span className="mr-1">₦</span>
                    <CountUp
                      end={wallet.balance}
                      duration={1.2}
                      separator=","
                    />
                  </>
                ) : (
                  '₦ ****'
                )}
              </h1>

              <BrandButton
                size="sm"
                onClick={() => setShowBal(!showBal)}
                className="rounded-full bg-white/20 p-2 backdrop-blur transition hover:bg-white/30"
              >
                {showBal ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </BrandButton>
            </div>
          </div>

          <div className="hidden flex-col items-end gap-1 md:flex">
            <p className="text-xs opacity-70">Wallet ID</p>
            <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 font-semibold text-sm backdrop-blur">
              {wallet.wallet_id}
              {copied ? (
                <Check className="h-4 w-4 cursor-pointer opacity-70 hover:opacity-100" />
              ) : (
                <Copy
                  className="h-4 w-4 cursor-pointer opacity-70 hover:opacity-100"
                  onClick={() => copyToClipboard(wallet.wallet_id)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="opacity-70">Deposits</p>
            <p className="mt-1 font-semibold">
              {showBal ? formatCurrency(wallet.total_deposit) : '****'}
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="opacity-70">Spent</p>
            <p className="mt-1 font-semibold">
              {showBal ? formatCurrency(wallet.total_spent) : '****'}
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="opacity-70">Withdrawals</p>
            <p className="mt-1 font-semibold">
              {showBal ? formatCurrency(wallet.total_withdrawal) : '****'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between md:justify-end">
          <div className="flex flex-col items-start gap-1 md:hidden">
            <p className="text-xs opacity-70">Wallet ID</p>
            <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 font-semibold text-sm backdrop-blur">
              {wallet.wallet_id}
              {copied ? (
                <Check className="h-4 w-4 cursor-pointer opacity-70 hover:opacity-100" />
              ) : (
                <Copy
                  className="h-4 w-4 cursor-pointer opacity-70 hover:opacity-100"
                  onClick={() => copyToClipboard(wallet.wallet_id)}
                />
              )}
            </div>
          </div>
          {hasPin ? (
            <BrandButton
              variant="outline"
              className="rounded-xl bg-white px-5 py-2 font-semibold text-sm text-zinc-900 hover:bg-zinc-100"
              onClick={() => setOpenUpdatePin(true)}
            >
              Update PIN
            </BrandButton>
          ) : (
            <BrandButton
              className="rounded-xl bg-white px-5 py-2 font-semibold text-sm text-zinc-900 hover:bg-zinc-100"
              onClick={() => setOpenSetPin(true)}
            >
              Set PIN
            </BrandButton>
          )}
        </div>
      </div>
      <SetWalletPin open={openSetPin} onClose={() => setOpenSetPin(false)} />
      <UpdateWalletPin
        open={openUpdatePin}
        onClose={() => setOpenUpdatePin(false)}
      />
    </>
  );
};

const SkeletonLoader = () => {
  return (
    <div className="relative mx-6 mt-6 h-64 animate-pulse overflow-hidden rounded-3xl bg-linear-to-br from-slate-100 via-slate-200 to-slate-100 p-6 shadow-md" />
  );
};
