import { differenceInDays, format } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, Home } from 'lucide-react';
import { formatCurrency } from '@/helpers/currency.helpers';
import { cn } from '@/lib/utils';
import type { Tenant } from './LandLordsTenancies';

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  inspection_paid: {
    label: 'Inspected',
    icon: Clock,
    className: 'bg-amber-100 text-amber-700',
  },
  committed: {
    label: 'Committed',
    icon: CheckCircle2,
    className: 'bg-blue-100 text-blue-700',
  },
  active: {
    label: 'Active',
    icon: CheckCircle2,
    className: 'bg-emerald-100 text-emerald-700',
  },
  expired: {
    label: 'Expired',
    icon: AlertCircle,
    className: 'bg-gray-100 text-gray-500',
  },
  terminated: {
    label: 'Terminated',
    icon: AlertCircle,
    className: 'bg-red-100 text-red-600',
  },
};

export const TenantCard = ({ tenant: t }: { tenant: Tenant }) => {
  const cfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.expired;
  const StatusIcon = cfg.icon;
  const daysLeft = t.end_date
    ? differenceInDays(new Date(t.end_date), new Date())
    : null;

  return (
    <div className="rounded-2xl border bg-white p-5 transition hover:shadow-sm">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 font-bold text-brand text-lg">
          {t.user_profiles?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-center gap-2">
            <p className="font-primary font-semibold text-gray-800">
              {t.user_profiles?.full_name ?? 'Unknown'}
            </p>
            <span
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-xs',
                cfg.className
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {cfg.label}
            </span>
          </div>
          <p className="font-secondary text-gray-400 text-xs">
            {t.user_profiles?.email}
          </p>
          {t.user_profiles?.phone && (
            <p className="font-secondary text-gray-400 text-xs">
              {t.user_profiles.phone}
            </p>
          )}
        </div>

        {/* Payout */}
        <div className="shrink-0 text-right">
          <p className="font-bold font-primary text-emerald-600 text-lg">
            {formatCurrency(t.landlord_payout)}
          </p>
          <p className="font-secondary text-gray-400 text-xs">your payout</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-4 flex flex-wrap gap-3 border-t pt-4">
        {t.properties && (
          <div className="flex items-center gap-2 text-sm">
            <Home className="h-3.5 w-3.5 text-brand" />
            <span className="max-w-48 truncate font-secondary text-gray-600">
              {t.properties.title}
            </span>
          </div>
        )}

        <span className="font-secondary text-gray-400 text-xs capitalize">
          {t.listing_type} · {t.duration_years} yr
          {t.duration_years > 1 ? 's' : ''}
        </span>

        {t.start_date && (
          <span className="font-secondary text-gray-400 text-xs">
            {format(new Date(t.start_date), 'MMM d, yyyy')}
            {' → '}
            {t.end_date ? format(new Date(t.end_date), 'MMM d, yyyy') : '—'}
          </span>
        )}

        {daysLeft !== null && daysLeft > 0 && daysLeft <= 30 && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 font-secondary text-amber-700 text-xs">
            Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
          </span>
        )}

        {t.legal_services_opted && (
          <span className="rounded-full bg-brand/5 px-2 py-0.5 font-secondary text-brand text-xs">
            Legal services
          </span>
        )}

        {t.payment_plan === 'instalment' && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 font-secondary text-blue-600 text-xs">
            Instalment plan
          </span>
        )}
      </div>
    </div>
  );
};
