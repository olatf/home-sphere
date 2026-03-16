import { Wallet } from 'lucide-react';
import Link from 'next/link';

export const WalletSummary = () => {
  return (
    <div>
      <Link
        href="/dashboard/wallet"
        className="border-brand flex items-center justify-between gap-1 rounded-sm border px-1 py-2 shadow-sm md:gap-2 md:px-3"
      >
        <Wallet className="size-5 text-zinc-900" />
        <span className="font-secondary text-sm font-normal text-zinc-900 md:text-base">
          &#8358;10,000
        </span>
      </Link>
    </div>
  );
};
