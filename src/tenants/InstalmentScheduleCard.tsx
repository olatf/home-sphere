'use client';

import { useQueryClient } from '@tanstack/react-query';
import { format, isPast, isToday } from 'date-fns';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { payInstalment } from '@/actions/tenancy';
import { Button } from '@/components/ui/button';
import { QUERY_KEYS } from '@/config/property';
import { formatCurrency } from '@/helpers/currency.helpers';
import { cn } from '@/lib/utils';

export interface InstalmentItem {
  instalment_number: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  paid_at?: string;
  reference?: string;
}

interface InstalmentScheduleCardProps {
  tenancyId: string;
  propertyTitle: string;
  schedule: InstalmentItem[];
  totalAmount: number;
}

// ─── Status config ────────────────────────────────────────────────

const ITEM_CONFIG = {
  paid: {
    icon: CheckCircle2,
    className: 'text-emerald-600',
    bg: 'bg-emerald-50',
    label: 'Paid',
  },
  pending: {
    icon: Clock,
    className: 'text-amber-600',
    bg: 'bg-amber-50',
    label: 'Pending',
  },
  overdue: {
    icon: AlertCircle,
    className: 'text-red-600',
    bg: 'bg-red-50',
    label: 'Overdue',
  },
};

// ─── Component ────────────────────────────────────────────────────

export function InstalmentScheduleCard({
  tenancyId,
  propertyTitle,
  schedule,
  totalAmount,
}: InstalmentScheduleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [paying, startPaying] = useTransition();
  const qc = useQueryClient();

  const paidCount = schedule.filter(s => s.status === 'paid').length;
  const totalCount = schedule.length;
  const paidAmount = schedule
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + s.amount, 0);
  const remaining = schedule.filter(
    s => s.status === 'pending' || s.status === 'overdue'
  );
  const nextDue = remaining[0];
  const overdueCount = schedule.filter(s => s.status === 'overdue').length;
  const progress = Math.round((paidCount / totalCount) * 100);

  async function handlePayInstalment() {
    startPaying(async () => {
      const r = await payInstalment(tenancyId);
      if (r.success) {
        toast.success(
          r.fullyPaid
            ? '🎉 All instalments paid! Tenancy is now fully active.'
            : `Instalment ${r.instalmentPaid} paid. ${r.remainingCount} remaining.`
        );
        qc.invalidateQueries({ queryKey: QUERY_KEYS.tenantTenancies() });
      } else {
        toast.error(r.error ?? 'Payment failed');
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      {/* Header */}
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="font-primary font-semibold text-gray-800">
              {propertyTitle}
            </p>
            <p className="font-secondary text-gray-400 text-xs">
              Instalment Plan
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold font-primary text-brand text-sm">
              {formatCurrency(paidAmount)}
            </p>
            <p className="font-secondary text-gray-400 text-xs">
              of {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-gray-500 text-xs">
            <span>
              {paidCount} of {totalCount} paid
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Overdue warning */}
        {overdueCount > 0 && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-red-600 text-xs">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {overdueCount} instalment{overdueCount > 1 ? 's are' : ' is'}{' '}
            overdue
          </div>
        )}

        {/* Next due CTA */}
        {nextDue && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-brand/20 bg-brand/5 px-3 py-2.5">
            <div>
              <p className="font-primary font-semibold text-gray-800 text-xs">
                Next: Instalment {nextDue.instalment_number}
              </p>
              <p
                className={cn(
                  'font-secondary text-xs',
                  isPast(new Date(nextDue.due_date))
                    ? 'font-medium text-red-500'
                    : isToday(new Date(nextDue.due_date))
                      ? 'font-medium text-amber-600'
                      : 'text-gray-500'
                )}
              >
                Due {format(new Date(nextDue.due_date), 'MMM d, yyyy')}
                {isPast(new Date(nextDue.due_date)) && ' (Overdue)'}
                {isToday(new Date(nextDue.due_date)) && ' (Today)'}
              </p>
            </div>
            <Button
              size="sm"
              className="shrink-0 bg-brand hover:bg-brand-dark"
              disabled={paying}
              onClick={handlePayInstalment}
            >
              {paying ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{' '}
                  Paying...
                </>
              ) : (
                <>
                  <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Pay{' '}
                  {formatCurrency(nextDue.amount)}
                </>
              )}
            </Button>
          </div>
        )}

        {paidCount === totalCount && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 font-semibold text-emerald-700 text-sm">
            <CheckCircle2 className="h-4 w-4" /> All instalments paid!
          </div>
        )}
      </div>

      {/* Toggle full schedule */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex w-full items-center justify-between border-t bg-gray-50 px-4 py-2.5 font-medium text-gray-500 text-xs transition hover:bg-gray-100"
      >
        <span>View full schedule ({totalCount} instalments)</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {/* Full schedule */}
      {expanded && (
        <div className="divide-y">
          {schedule.map(item => {
            const cfg = ITEM_CONFIG[item.status];
            const StatusIcon = cfg.icon;
            const isOverdue =
              item.status === 'overdue' ||
              (item.status === 'pending' && isPast(new Date(item.due_date)));
            return (
              <div
                key={item.instalment_number}
                className={cn(
                  'flex items-center gap-3 px-4 py-3',
                  isOverdue && 'bg-red-50/50'
                )}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                    cfg.bg
                  )}
                >
                  <StatusIcon className={cn('h-3.5 w-3.5', cfg.className)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium font-secondary text-gray-800 text-sm">
                    Instalment {item.instalment_number}
                  </p>
                  <p
                    className={cn(
                      'font-secondary text-xs',
                      isOverdue ? 'text-red-500' : 'text-gray-400'
                    )}
                  >
                    {item.status === 'paid'
                      ? `Paid ${item.paid_at ? format(new Date(item.paid_at), 'MMM d, yyyy') : ''}`
                      : `Due ${format(new Date(item.due_date), 'MMM d, yyyy')}${isOverdue ? ' — Overdue' : ''}`}
                  </p>
                </div>
                <p
                  className={cn(
                    'shrink-0 font-primary font-semibold text-sm',
                    item.status === 'paid'
                      ? 'text-emerald-600'
                      : 'text-gray-800'
                  )}
                >
                  {formatCurrency(item.amount)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
