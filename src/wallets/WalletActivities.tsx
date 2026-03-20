'use client';

import { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  XCircle,
  Receipt,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useUserWallet } from '@/hooks/useWallet';
import { useInvalidateWallet } from '@/hooks/Useinvalidatewallet';
import { formatCurrency } from '@/helpers/currency.helpers';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { Badge } from '@/components/ui/badge';
import { PAGE_SIZE } from '@/config/constants';
import { Pagination } from '@/components/common/Pagination';
import { cn } from '@/lib/utils';

type WalletTransaction = {
  id: string;
  transaction_type: string;
  amount: string;
  status: string;
  created_at: string;
  updated_at: string;
  type: string;
  description?: string;
};

const TYPE_LABELS: Record<string, string> = {
  deposit: 'Top Up',
  inspection_payment: 'Inspection',
  rent_payment: 'Rent',
  purchase_payment: 'Purchase',
  admin_transfer: 'Transfer',
  transfer_out: 'Transfer Out',
  transfer_in: 'Transfer In',
  landlord_payout: 'Payout',
  withdrawal: 'Withdrawal',
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700',
  },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  failed: { label: 'Failed', className: 'bg-red-50 text-red-600' },
};

function TransactionIcon({ type }: { type: string }) {
  const isCredit = type === 'credit' || type === 'deposit';
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isCredit ? 'bg-emerald-50' : 'bg-rose-50'}`}
    >
      {isCredit ? (
        <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
      ) : (
        <ArrowUpRight className="h-4 w-4 text-rose-500" />
      )}
    </div>
  );
}

function TransactionItem({ tx }: { tx: WalletTransaction }) {
  const isCredit = tx.type === 'credit' || tx.transaction_type === 'deposit';
  const isPending = tx.status === 'pending';
  const statusCfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.pending;

  return (
    <div className="flex items-center gap-2 rounded-xl px-2 py-3 transition hover:bg-gray-50 md:gap-3 md:px-4">
      <TransactionIcon type={tx.type} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 md:gap-2">
          <p className="truncate text-sm font-medium text-gray-800">
            {tx.description ||
              TYPE_LABELS[tx.transaction_type] ||
              tx.transaction_type}
          </p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.className}`}
          >
            {statusCfg.label}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-400 md:gap-2">
          <span>{TYPE_LABELS[tx.transaction_type] ?? tx.transaction_type}</span>
          <span>·</span>
          <span>
            {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>

      <p
        className={cn(
          'shrink-0 text-sm font-semibold',
          isCredit ? 'text-emerald-600' : 'text-rose-500',
          isPending && 'text-amber-600'
        )}
      >
        {isCredit ? '+' : '-'} {formatCurrency(Number(tx.amount))}
      </p>
    </div>
  );
}

function TransactionSkeleton() {
  return (
    <div>
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-linear-to-br from-gray-100 via-slate-200 to-gray-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-2/3 animate-pulse rounded bg-linear-to-br from-gray-100 via-slate-200 to-gray-100" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-linear-to-br from-gray-100 via-slate-200 to-gray-100" />
          </div>
          <div className="h-3 w-16 animate-pulse rounded bg-linear-to-br from-gray-100 via-slate-200 to-gray-100" />
        </div>
      ))}
    </div>
  );
}

export const WalletActivities = () => {
  const { transactions, isLoading } = useUserWallet();
  const { invalidate } = useInvalidateWallet();

  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Reset to page 1 whenever filter changes
  function handleFilterChange(f: string) {
    setFilter(f);
    setPage(1);
  }

  // Build filter tabs from actual transaction types in the data
  const filterTabs = useMemo(() => {
    const uniqueTypes = [...new Set(transactions.map(t => t.transaction_type))];
    return ['All', ...uniqueTypes];
  }, [transactions]);

  // Apply filter
  const filtered = useMemo(() => {
    if (filter === 'All') return transactions;
    return transactions.filter(tx => tx.transaction_type === filter);
  }, [transactions, filter]);

  // Paginate
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleRefresh() {
    setRefreshing(true);
    await invalidate();
    await new Promise(r => setTimeout(r, 600));
    setRefreshing(false);
  }

  function getTabLabel(f: string) {
    if (f === 'All') return 'All';
    return TYPE_LABELS[f] ?? f.replace(/_/g, ' ');
  }

  if (isLoading) {
    return (
      <div className="mx-7 my-10 rounded-2xl border bg-white">
        <TransactionSkeleton />
      </div>
    );
  }

  return (
    <AnimatedWrapper type="slideInUp">
      <div className="mx-3 my-5 rounded-2xl border bg-white md:mx-7 md:my-10">
        <div className="flex items-center justify-between border-b px-2 py-2 md:px-5 md:py-4">
          <div className="flex items-center gap-2">
            <Receipt className="size-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800">
              Transactions
            </h3>
            {transactions.length > 0 && (
              <Badge className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {transactions.length}
              </Badge>
            )}
          </div>
          <button
            onClick={handleRefresh}
            className="rounded-full p-1 text-gray-400 transition hover:text-gray-600"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="scrollbar-none flex items-center gap-1 overflow-x-auto border-b px-3 py-2 md:px-5">
          <Filter className="mr-1 size-3.5 shrink-0 text-gray-300" />
          {filterTabs.map(f => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`shrink-0 rounded-lg px-2 py-1 text-xs font-medium capitalize transition md:px-3 ${
                filter === f
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {getTabLabel(f)}
            </button>
          ))}
        </div>

        {/* Transaction list */}
        <div className="divide-y divide-gray-50 px-1">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center md:py-14">
              {filter === 'All' ? (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                    <Receipt className="h-5 w-5 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    No transactions yet
                  </p>
                  <p className="text-xs text-gray-400">
                    Top up your wallet to get started.
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-8 w-8 text-gray-200" />
                  <p className="text-sm text-gray-400">
                    No {getTabLabel(filter).toLowerCase()} transactions
                  </p>
                </>
              )}
            </div>
          ) : (
            paginated.map(tx => <TransactionItem key={tx.id} tx={tx} />)
          )}
        </div>

        {/* Pagination */}
        {(totalPages > 1 || transactions.some(t => t.status === 'pending')) && (
          <div className="space-y-3 border-t px-5 py-4">
            {totalPages > 1 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>
                    Showing {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, filtered.length)} of{' '}
                    {filtered.length}
                  </span>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                </div>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  disabled={refreshing}
                />
              </div>
            )}

            {transactions.some(t => t.status === 'pending') && (
              <div className="flex items-center gap-2 text-xs text-amber-600">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Some transactions are still processing and may take up to 24
                  hours.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </AnimatedWrapper>
  );
};
