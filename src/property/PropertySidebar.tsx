'use client';

import {
  ChevronDown,
  ChevronUp,
  CreditCard,
  Info,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BrandRadioSelectors } from '@/components/common/BrandRadioSelectors';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { baseClass } from '@/config/constants';
import { formatCurrency } from '@/helpers/currency.helpers';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';
import { usePaymentStore } from '@/stores/paymentStore';
import type { FeeBreakdown, Property } from '@/types/property';

interface PropertySidebarProps {
  property: Property;
  isTenant: boolean;
  isLandlord: boolean;
  isAdmin: boolean;
  canInspect: boolean;
  canPurchase: boolean;
  hasCommitted: boolean;
  inspection_id: string | undefined;
  legalServicesOpted: boolean;
  paymentPlan: 'full' | 'instalment';
  durationYears: number;
  fees: FeeBreakdown;
  inspectionFee: number;
  onToggleLegal: () => void;
  onSetPaymentPlan: (plan: 'full' | 'instalment') => void;
  onSetDuration: (years: number) => void;
  onEditProperty: () => void;
  onReviewProperty: () => void;
}

function FeeRow({
  label,
  amount,
  sublabel,
  highlight,
  positive,
}: {
  label: string;
  amount: number;
  sublabel?: string;
  highlight?: boolean;
  positive?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-2 text-sm',
        highlight && 'font-semibold'
      )}
    >
      <div className="min-w-0">
        <p className={highlight ? 'text-gray-900' : 'text-gray-600'}>{label}</p>
        {sublabel && (
          <p className="font-secondary text-gray-400 text-xs">{sublabel}</p>
        )}
      </div>
      <span
        className={cn(
          'shrink-0 font-medium',
          positive
            ? 'text-emerald-600'
            : highlight
              ? 'text-gray-900'
              : 'text-gray-700'
        )}
      >
        {positive ? '+' : ''}
        {formatCurrency(amount)}
      </span>
    </div>
  );
}

function InstalmentBreakdown({
  fees,
  plan,
}: {
  fees: FeeBreakdown;
  plan: {
    duration_months: number;
    interest_rate_percent: number;
    min_initial_payment_percent: number;
  };
}) {
  const [expanded, setExpanded] = useState(false);

  const initial_deposit = (fees as FeeBreakdown).initial_deposit ?? 0;
  const interest_amount = (fees as FeeBreakdown).interest_amount ?? 0;
  const monthly_payment = (fees as FeeBreakdown).monthly_payment ?? 0;
  const total_with_interest = (fees as FeeBreakdown).total_with_interest ?? 0;

  return (
    <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex w-full items-center justify-between font-semibold text-blue-800"
      >
        <span className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5" /> Instalment Plan
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 border-blue-200 border-t pt-3">
          <div className="flex justify-between text-blue-700">
            <span>Initial deposit ({plan.min_initial_payment_percent}%)</span>
            <span className="font-semibold">
              {formatCurrency(initial_deposit)}
            </span>
          </div>
          <div className="flex justify-between text-blue-700">
            <span>Interest ({plan.interest_rate_percent}%)</span>
            <span className="font-semibold">
              +{formatCurrency(interest_amount)}
            </span>
          </div>
          <div className="flex justify-between text-blue-700">
            <span>Monthly payment × {plan.duration_months}</span>
            <span className="font-semibold">
              {formatCurrency(monthly_payment)}/mo
            </span>
          </div>
          <div className="flex justify-between border-blue-200 border-t pt-2 font-bold text-blue-900">
            <span>Total (with interest)</span>
            <span>{formatCurrency(total_with_interest)}</span>
          </div>
          <p className="pt-1 font-secondary text-blue-600 text-xs">
            You pay {formatCurrency(initial_deposit)} today, then{' '}
            {formatCurrency(monthly_payment)}/month for {plan.duration_months}{' '}
            months.
          </p>
        </div>
      )}
    </div>
  );
}

export function PropertySidebar({
  property,
  isTenant,
  isLandlord,
  isAdmin,
  canInspect,
  canPurchase,
  hasCommitted,
  legalServicesOpted,
  paymentPlan,
  inspection_id,
  durationYears,
  fees,
  inspectionFee,
  onToggleLegal,
  onSetPaymentPlan,
  onSetDuration,
  onEditProperty,
  onReviewProperty,
}: PropertySidebarProps) {
  const { openPayment } = usePaymentStore();
  const { isUserAuthenticated, isLoading } = useUserProfile();

  const router = useRouter();

  const isInstalment = paymentPlan === 'instalment';
  const showDuration = isTenant && property.listing_type !== 'sale';
  const showInstalment =
    isTenant &&
    property.pricing.allows_instalment &&
    property.pricing.instalment_plan;
  const showLegal =
    isTenant && property.legal_services_available && canPurchase;
  const plan = property.pricing.instalment_plan;

  // What the tenant pays right now when clicking "Pay for Property"
  const amountDueNow =
    isInstalment && plan
      ? (fees.tenant_total * plan.min_initial_payment_percent) / 100
      : fees.tenant_total;

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );

  return (
    <div className="w-full space-y-4 lg:col-span-1">
      {/*  Price card */}
      <div className="rounded-2xl border bg-white p-3 shadow-sm">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="font-bold font-primary text-2xl text-brand">
              {formatCurrency(property.pricing.price)}
            </p>
            {property.listing_type !== 'sale' && (
              <p className="font-secondary text-gray-400 text-xs">per year</p>
            )}
          </div>
          {property.available_units > 0 ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 text-xs">
              {property.available_units} unit
              {property.available_units !== 1 ? 's' : ''} available
            </span>
          ) : (
            <span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-600 text-xs">
              No units available
            </span>
          )}
        </div>

        <Separator className="my-4" />

        {!isUserAuthenticated ? (
          <div className="space-y-4 px-2">
            <p>Sign-in to view more details</p>
            <Button
              onClick={() => router.push('/sign-in')}
              className="w-full bg-brand hover:bg-brand-dark"
            >
              Sign-in
            </Button>
          </div>
        ) : (
          <>
            {/* Duration selector */}
            {showDuration && (
              <div className="mb-4 space-y-2">
                <p className="font-primary font-semibold text-gray-700 text-xs">
                  How many years?{' '}
                  <span className="font-normal text-gray-400">
                    (max {property.max_duration_years})
                  </span>
                </p>
                <Select
                  value={durationYears.toString()}
                  onValueChange={v => onSetDuration(parseInt(v, 10))}
                >
                  <SelectTrigger className={cn('px-3', baseClass)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: property.max_duration_years },
                      (_, i) => (
                        <SelectItem
                          key={i.toString()}
                          value={(i + 1).toString()}
                        >
                          {i + 1} {i + 1 === 1 ? 'year' : 'years'}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Payment plan selector*/}
            {showInstalment && (
              <div className="mb-4 space-y-2">
                <p className="font-primary font-semibold text-gray-700 text-xs">
                  Payment Plan
                </p>
                <BrandRadioSelectors<'full' | 'instalment'>
                  ariaLabel="payment plan"
                  value={paymentPlan}
                  className="text-xs"
                  onChange={onSetPaymentPlan}
                  options={[
                    { value: 'full', label: 'Full Payment' },
                    { value: 'instalment', label: 'Instalment' },
                  ]}
                />
                {isInstalment && plan && (
                  <p className="font-secondary text-gray-500 text-xs">
                    Minimum {plan.min_initial_payment_percent}% deposit today,{' '}
                    {plan.duration_months} months at{' '}
                    {plan.interest_rate_percent}% interest.
                  </p>
                )}
              </div>
            )}

            {/* Fee breakdown */}
            <div className="space-y-2.5">
              {/* Base rent × duration */}
              {property.listing_type !== 'sale' && durationYears > 1 && (
                <FeeRow
                  label={`${formatCurrency(property.pricing.price)} × ${durationYears} yr${durationYears > 1 ? 's' : ''}`}
                  amount={property.pricing.price * durationYears}
                  sublabel="Total rent"
                />
              )}

              {/* Caution fee */}
              {(property.pricing.caution_fee ?? 0) > 0 && (
                <FeeRow
                  label="Caution Fee"
                  amount={property.pricing.caution_fee!}
                  sublabel="One-time refundable deposit"
                />
              )}

              <FeeRow
                label="Platform Fee"
                amount={fees.tenant_fee}
                sublabel="5% of base price"
              />

              {showLegal && (
                <div className="rounded-xl border border-brand/20 bg-brand/5 p-3">
                  <label className="flex cursor-pointer items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={legalServicesOpted}
                      onChange={onToggleLegal}
                      className="mt-0.5 h-4 w-4 rounded border-brand accent-brand"
                    />
                    <div className="flex-1">
                      <p className="font-primary font-semibold text-gray-800 text-sm">
                        Legal Protection{' '}
                        <span className="text-brand">(+5%)</span>
                      </p>
                      <p className="mt-0.5 font-secondary text-gray-500 text-xs">
                        HomeSphere covers you in disputes, evictions, and
                        contract enforcement.
                      </p>
                    </div>
                  </label>
                  {legalServicesOpted && (
                    <div className="mt-2 flex justify-between border-brand/20 border-t pt-2 font-semibold text-brand text-xs">
                      <span>Legal fee</span>
                      <span>+{formatCurrency(fees.legal_fee)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Instalment breakdown */}
              {isTenant && isInstalment && plan && (
                <InstalmentBreakdown fees={fees} plan={plan} />
              )}

              {/* Total divider */}
              {isTenant && canPurchase && (
                <>
                  <Separator />
                  {isInstalment && plan ? (
                    <>
                      {/* Instalment: show due today vs total */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold font-primary text-gray-900 text-sm">
                            Due Today
                          </p>
                          <p className="font-secondary text-gray-400 text-xs">
                            Initial deposit ({plan.min_initial_payment_percent}
                            %)
                          </p>
                        </div>
                        <p className="font-bold font-primary text-brand text-lg">
                          {formatCurrency(amountDueNow)}
                        </p>
                      </div>
                      <div className="flex items-start justify-between text-gray-500 text-sm">
                        <p>Total (with interest)</p>
                        <p className="font-medium">
                          {formatCurrency(
                            (fees as FeeBreakdown).total_with_interest ??
                              fees.tenant_total
                          )}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="font-bold font-primary text-gray-900 text-sm">
                        Total Due
                      </p>
                      <p className="font-bold font-primary text-brand text-lg">
                        {formatCurrency(fees.tenant_total)}
                      </p>
                    </div>
                  )}
                </>
              )}
              {isTenant && canInspect && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <div>
                      <p className="font-primary font-semibold text-gray-700 text-sm">
                        Inspection Fee
                      </p>
                      <p className="font-secondary text-gray-400 text-xs">
                        Admin-set fee for this property type
                      </p>
                    </div>
                    <p className="font-bold font-primary text-gray-900">
                      {formatCurrency(inspectionFee)}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-2">
              {/* Tenant: Book Inspection */}
              {canInspect && (
                <Button
                  className="w-full bg-brand hover:bg-brand-dark"
                  disabled={!inspectionFee}
                  onClick={() => {
                    openPayment({
                      amount: inspectionFee ?? 0,
                      label: 'Book Inspection',
                      description: `Inspection for "${property.title}"`,
                      transactionType: 'inspection_payment',
                      metadata: {
                        property_id: property.id,
                        property_type: property.property_type,
                        preferred_date: new Date(
                          Date.now() + 3 * 24 * 60 * 60 * 1000
                        ).toISOString(),
                      },
                      onSuccess: () => router.push('/dashboard/rent'),
                    });
                  }}
                >
                  Book Inspection — {formatCurrency(inspectionFee)}
                </Button>
              )}

              {/* Tenant: Pay */}
              {canPurchase && !hasCommitted && (
                <Button
                  className="w-full bg-brand hover:bg-brand-dark"
                  onClick={() => {
                    openPayment({
                      amount: fees.tenant_total,
                      label: 'Pay for Property',
                      description: `${property.listing_type === 'sale' ? 'Purchase' : 'Rent'} payment for "${property.title}"`,
                      transactionType:
                        property.listing_type === 'sale'
                          ? 'purchase_payment'
                          : 'rent_payment',
                      metadata: {
                        property_id: property.id,
                        listing_type: property.listing_type,
                        inspection_id,
                        duration_years: durationYears,
                        payment_plan: paymentPlan,
                        legal_services_opted: legalServicesOpted,
                      },
                      onSuccess: () => router.push('/dashboard/rent'),
                    });
                  }}
                >
                  {isInstalment
                    ? `Pay Deposit — ${formatCurrency(amountDueNow)}`
                    : `Pay — ${formatCurrency(fees.tenant_total)}`}
                </Button>
              )}

              {/* No units */}
              {isTenant &&
                property.available_units === 0 &&
                !canInspect &&
                !canPurchase && (
                  <p className="rounded-lg bg-gray-50 px-3 py-2 text-center font-secondary text-gray-500 text-sm">
                    No units currently available
                  </p>
                )}

              {/* Landlord */}
              {isLandlord && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onEditProperty}
                >
                  Edit Property
                </Button>
              )}

              {/* Admin */}
              {isAdmin && property.status === 'pending_review' && (
                <Button
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={onReviewProperty}
                >
                  Review Property
                </Button>
              )}
            </div>

            {/* Instalment note */}
            {isTenant && canPurchase && isInstalment && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-700 text-xs">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p className="font-secondary">
                  After paying the deposit today, you&apos;ll see your
                  instalment schedule in <strong>My Rent</strong> and can pay
                  each instalment when due.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
