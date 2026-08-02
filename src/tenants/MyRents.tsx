'use client';

import { differenceInDays, format } from 'date-fns';
import { Calendar, Clock, Home, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { BrandButton } from '@/components/common/BrandButton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/helpers/currency.helpers';
import { formatDateAndTime } from '@/helpers/date.helpers';
import { getErrorMessage } from '@/helpers/error.helpers';
import {
  useTenantInspections,
  useTenantTenancies,
  useUpdateInspectionStatusMutation,
} from '@/hooks/useTenants';
import { cn } from '@/lib/utils';
import { type CardDetails, SummaryInfoCard } from '@/task';
import {
  INSPECTION_STATUS,
  type InspectionRow,
  TENANCY_STATUS,
  type TenancyRow,
} from '@/types/tenancy';
import { InstalmentScheduleCard } from './InstalmentScheduleCard';

export const MyRents = () => {
  const router = useRouter();
  const [tab, setTab] = useState<'tenancies' | 'inspections'>('tenancies');

  const { data: inspData, isLoading: loadingInsp } = useTenantInspections();
  const { data: tenData, isLoading: loadingTen } = useTenantTenancies();
  const updateInspectionStatusMutation = useUpdateInspectionStatusMutation();

  const inspections = (inspData?.data ?? []) as InspectionRow[];
  const tenancies = (tenData?.data ?? []) as TenancyRow[];
  const loading = loadingInsp || loadingTen;

  const stats: CardDetails[] = [
    {
      label: 'Active Tenancies',
      value: tenancies.filter(t => t.status === 'active').length,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Committed',
      value: tenancies.filter(t => t.status === 'committed').length,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Inspections',
      value: inspections.filter(
        i => i.status === 'pending' || i.status === 'scheduled'
      ).length,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Total Paid',
      value: formatCurrency(
        tenancies.reduce((sum, t) => sum + t.total_amount, 0)
      ),
      color: 'text-brand',
      bg: 'bg-brand/5',
    },
  ];

  const handleCancelInspection = async (
    inspectionId: string,
    newStatus: 'scheduled' | 'completed' | 'cancelled'
  ) => {
    try {
      await updateInspectionStatusMutation.mutateAsync({
        inspectionId,
        status: newStatus,
      });
      toast.success('Inspection was successfully Cancelled');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(`Failed to cancel inspection: ${errorMessage}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold font-primary text-2xl text-gray-900">
          My Rent
        </h1>
        <p className="mt-0.5 font-secondary text-gray-500 text-sm">
          Your inspections and active tenancies
        </p>
      </div>

      <SummaryInfoCard cardDetails={stats} />

      <div className="flex overflow-hidden rounded-xl border">
        {(['tenancies', 'inspections'] as const).map(t => (
          <BrandButton
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2.5 font-medium text-sm capitalize transition',
              tab === t
                ? 'bg-brand text-white'
                : 'text-gray-500 hover:bg-gray-50'
            )}
          >
            {t === 'tenancies'
              ? `Tenancies (${tenancies.length})`
              : `Inspections (${inspections.length})`}
          </BrandButton>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : tab === 'tenancies' ? (
        tenancies.length === 0 ? (
          <EmptyState
            icon={Home}
            title="No tenancies yet"
            subtitle="Browse properties and make a payment to get started."
            action={{ label: 'Browse Properties', href: '/properties' }}
          />
        ) : (
          <div className="space-y-4">
            {tenancies.map(t => (
              <div
                key={t.id}
                className="overflow-hidden rounded-2xl border bg-white transition hover:shadow-sm"
              >
                <div className="flex gap-4 p-5">
                  {t.properties && (
                    <Image
                      src={t.properties.feature_image}
                      alt={t.properties.title}
                      width={96}
                      height={80}
                      className="h-20 w-24 shrink-0 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="truncate font-primary font-semibold text-gray-800">
                        {t.properties?.title ?? 'Property'}
                      </p>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 font-medium text-xs',
                          TENANCY_STATUS[t.status]?.className ??
                            'bg-gray-100 text-gray-500'
                        )}
                      >
                        {TENANCY_STATUS[t.status]?.label ?? t.status}
                      </span>
                    </div>
                    <p className="font-secondary text-gray-400 text-xs">
                      {t.properties?.location.city},{' '}
                      {t.properties?.location.state}
                    </p>
                    <p className="mt-1 font-bold font-primary text-base text-brand">
                      {formatCurrency(t.total_amount)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-wrap gap-4 px-5 py-3 text-xs">
                  <div className="flex items-center gap-1 font-secondary text-gray-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {t.start_date
                      ? format(new Date(t.start_date), 'MMM d, yyyy')
                      : 'N/A'}
                    {t.end_date &&
                      ` → ${format(new Date(t.end_date), 'MMM d, yyyy')}`}
                  </div>
                  <span className="font-secondary text-gray-400 capitalize">
                    {t.listing_type} · {t.duration_years} yr
                    {t.duration_years > 1 ? 's' : ''}
                  </span>
                  {t.legal_services_opted && (
                    <span className="font-secondary text-brand">
                      Legal services included
                    </span>
                  )}
                  {t.payment_plan === 'instalment' && (
                    <span className="font-secondary text-blue-600">
                      Instalment plan
                    </span>
                  )}
                  <span className="font-secondary text-gray-300">
                    Ref: {t.payment_reference}
                  </span>
                </div>

                {t.payment_plan === 'instalment' && t.instalment_schedule && (
                  <InstalmentScheduleCard
                    tenancyId={t.id}
                    propertyTitle={t.properties?.title ?? ''}
                    schedule={t.instalment_schedule}
                    totalAmount={t.total_amount}
                  />
                )}

                {/* Expiry warning */}
                {t.end_date &&
                  differenceInDays(new Date(t.end_date), new Date()) <= 30 &&
                  differenceInDays(new Date(t.end_date), new Date()) > 0 && (
                    <div className="flex items-center gap-2 bg-amber-50 px-5 py-2.5 text-amber-700 text-xs">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      Tenancy expires in{' '}
                      {differenceInDays(new Date(t.end_date), new Date())}{' '}
                      day(s)
                    </div>
                  )}
              </div>
            ))}
          </div>
        )
      ) : inspections.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No inspections yet"
          subtitle="Book an inspection on any property to get started."
          action={{ label: 'Browse Properties', href: '/properties' }}
        />
      ) : (
        <div className="space-y-4">
          {inspections.map(i => {
            const daysLeft = i.expires_at
              ? differenceInDays(new Date(i.expires_at), new Date())
              : null;

            const isExpired =
              i.status === 'expired' || (daysLeft !== null && daysLeft < 0);

            const hasScheduledDate =
              !!i.scheduled_date && i.status === 'scheduled';

            return (
              <div
                key={i.id}
                className="overflow-hidden rounded-2xl border bg-white transition hover:shadow-sm"
              >
                <div className="flex gap-4 p-5">
                  {i.properties && (
                    <Image
                      src={i.properties?.feature_image}
                      alt={i.properties?.title}
                      width={96}
                      height={80}
                      className="h-20 w-24 shrink-0 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="truncate font-primary font-semibold text-gray-800">
                        {i.properties?.title ?? 'Property'}
                      </p>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 font-medium text-xs',
                          INSPECTION_STATUS[i.status]?.className ??
                            'bg-gray-100 text-gray-500'
                        )}
                      >
                        {INSPECTION_STATUS[i.status]?.label ?? i.status}
                      </span>
                    </div>
                    <p className="font-secondary text-gray-400 text-xs">
                      {i.properties?.location?.city},{' '}
                      {i.properties?.location?.state}
                    </p>
                    <p className="mt-1 font-primary font-semibold text-gray-700 text-sm">
                      Fee paid: {formatCurrency(i.inspection_fee)}
                    </p>
                  </div>
                </div>
                {hasScheduledDate ? (
                  <div className="flex items-center gap-2 bg-blue-50 px-5 py-2.5 text-blue-700 text-xs">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    Inspection has been scheduled for{' '}
                    {formatDateAndTime(i.scheduled_date).date} at{' '}
                    {formatDateAndTime(i.scheduled_date).time}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-50 px-5 py-2.5 text-gray-500 text-xs">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    Awaiting scheduling by admin
                  </div>
                )}

                {!i.has_committed_to_property ? (
                  <>
                    {!isExpired &&
                      i.status === 'completed' &&
                      daysLeft !== null && (
                        <div
                          className={cn(
                            'flex items-center gap-2 px-5 py-2.5 text-xs',
                            daysLeft <= 3
                              ? 'bg-red-50 text-red-600'
                              : 'bg-amber-50 text-amber-700'
                          )}
                        >
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          {daysLeft > 0
                            ? `${daysLeft} day(s) left to commit to this property`
                            : 'Last day to commit!'}
                        </div>
                      )}

                    <div className="flex items-center justify-end gap-5 px-5 py-3">
                      <BrandButton
                        variant={'ghost'}
                        onClick={() =>
                          router.push(`/properties/${i.property_id}`)
                        }
                      >
                        {isExpired ? 'Book Inspection' : 'Pay for Property'}
                      </BrandButton>
                      <BrandButton
                        variant={'ghost'}
                        className="bg-rose-500 text-white hover:bg-rose-600"
                        onClick={() =>
                          handleCancelInspection(i.id, 'cancelled')
                        }
                      >
                        Cancel Inspection
                      </BrandButton>
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  action?: { label: string; href: string };
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
        <Icon className="h-7 w-7 text-brand" />
      </div>
      <p className="font-primary font-semibold text-base text-gray-700">
        {title}
      </p>
      <p className="font-secondary text-gray-400 text-sm">{subtitle}</p>
      {action && (
        <Button
          className="mt-2 bg-brand hover:bg-brand-dark"
          onClick={() => router.push(action.href)}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
