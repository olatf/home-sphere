'use client';

import { Wallet } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/helpers/currency.helpers';
import { useUserWallet } from '@/hooks/useWallet';

export const WalletSummary = () => {
  const { wallet, isLoading } = useUserWallet();

  return (
    <div>
      <Link
        href="/dashboard/wallet"
        className="flex items-center justify-between gap-1 rounded-sm border border-brand px-1 py-2 shadow-sm md:gap-2 md:px-3"
      >
        <Wallet className="size-5 text-zinc-900" />
        <span className="font-normal font-secondary text-sm text-zinc-900 md:text-base">
          {!isLoading ? formatCurrency(wallet.balance) : '0.00'}
        </span>
      </Link>
    </div>
  );
};
