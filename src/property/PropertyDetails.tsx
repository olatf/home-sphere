'use client';

import { differenceInDays, format } from 'date-fns';
import {
  AlertCircle,
  Bath,
  Bed,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Droplets,
  Dumbbell,
  Edit,
  Eye,
  FileText,
  Heart,
  MapPin,
  Maximize2,
  ScanSearch,
  Shield,
  Trees,
  Video,
  Wifi,
  Zap,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useReducer } from 'react';
import { toast } from 'sonner';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandMap } from '@/components/common/BrandMap';
import { BrandStarRating } from '@/components/common/BrandStarRating';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TimeInterval } from '@/helpers/date.helpers';
import { useInspectionFees, useProperty } from '@/hooks/useProperty';
import {
  useRateProperty,
  useTenantInspections,
  useToggleBookmark,
} from '@/hooks/useTenants';
import type { Role } from '@/lib/accessPolice';
import { cn } from '@/lib/utils';
import type { Inspection, ListingType, Property } from '@/types/property';
import { calculateFees } from '@/types/property';
import type { PaymentModal as PPModalType } from '@/wallets';
import { PropertyGallery } from './Propertygallery';
import { PropertySidebar } from './PropertySidebar';

const PropertyPaymentModal = dynamic<React.ComponentProps<typeof PPModalType>>(
  () => import('@/wallets').then(m => m.PaymentModal),
  { ssr: false, loading: () => null }
);

const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: Edit, className: 'bg-gray-100 text-gray-600' },
  pending_review: {
    label: 'Pending Review',
    icon: Clock,
    className: 'bg-amber-100 text-amber-700',
  },
  approved: {
    label: 'Live',
    icon: CheckCircle2,
    className: 'bg-emerald-100 text-emerald-700',
  },
  revised: {
    label: 'Revised',
    icon: ScanSearch,
    className: 'bg-amber-100 text-amber-700',
  },
  rejected: {
    label: 'Rejected',
    icon: AlertCircle,
    className: 'bg-red-100 text-red-600',
  },
  suspended: {
    label: 'Suspended',
    icon: AlertCircle,
    className: 'bg-orange-100 text-orange-700',
  },
} as const;

const AMENITY_ICONS: Record<string, React.ElementType> = {
  swimming_pool: Droplets,
  gym: Dumbbell,
  generator: Zap,
  internet: Wifi,
  security: Shield,
  parking: Car,
  garden: Trees,
};

interface UIState {
  activeImage: number;
  userRating: number;
  legalServicesOpted: boolean;
  paymentPlan: 'full' | 'instalment';
  durationinterests: number;
}

type UIAction =
  | { type: 'SET_IMAGE'; index: number }
  | { type: 'SET_RATING'; rating: number }
  | { type: 'SET_DURATION'; duration: number }
  | { type: 'SET_PAYMENT_PLAN'; plan: 'full' | 'instalment' }
  | { type: 'TOGGLE_LEGAL' };

function reducer(s: UIState, a: UIAction): UIState {
  switch (a.type) {
    case 'SET_IMAGE':
      return { ...s, activeImage: a.index };
    case 'SET_RATING':
      return { ...s, userRating: a.rating };
    case 'SET_DURATION':
      return { ...s, durationinterests: a.duration };
    case 'SET_PAYMENT_PLAN':
      return { ...s, paymentPlan: a.plan };
    case 'TOGGLE_LEGAL':
      return { ...s, legalServicesOpted: !s.legalServicesOpted };
    default:
      return s;
  }
}

interface PropertyDetailsPageProps {
  propertyId: string;
  role: Role;
  userId: string;
}

export function PropertyDetails({
  propertyId,
  role,
  userId,
}: PropertyDetailsPageProps) {
  const router = useRouter();

  const [
    { userRating, legalServicesOpted, paymentPlan, durationinterests },
    dispatch,
  ] = useReducer(reducer, {
    activeImage: 0,
    userRating: 0,
    legalServicesOpted: false,
    paymentPlan: 'full',
    durationinterests: 1,
  });

  const {
    data: propData,
    isLoading,
    error: propError,
  } = useProperty(propertyId);

  const { data: fees, isLoading: inspectionLoading } = useInspectionFees();

  const { data: inspData } = useTenantInspections();

  const bookmarkMutation = useToggleBookmark();
  const ratingMutation = useRateProperty();

  const property = propData?.data as
    | (Property & {
        user_profiles?: {
          full_name: string;
          avatar_url: string;
          phone: string;
          email: string;
        };
      })
    | null;

  const inspectionFees =
    !inspectionLoading && property?.property_type
      ? fees?.find(f => f.property_type === property.property_type)
      : null;

  const isLandlord = property?.landlord_id === userId;
  const isTenant = role === 'tenant';
  const isAdmin = ['admin', 'superAdmin', 'administrator'].includes(role);

  const inspections = (inspData?.data ?? []) as Inspection[];
  const inspection = isTenant
    ? (inspections.find(
        i =>
          i.property_id === propertyId &&
          i.status !== 'expired' &&
          i.status !== 'cancelled'
      ) ?? null)
    : null;

  async function handleBookmark() {
    const r = await bookmarkMutation.mutateAsync(propertyId);
    if (r.success)
      toast.success(
        r.bookmarked ? 'Added to wishlist' : 'Removed from wishlist'
      );
    else toast.error('Failed to update wishlist');
  }

  async function handleRate(rating: number) {
    dispatch({ type: 'SET_RATING', rating });
    const r = await ratingMutation.mutateAsync({ propertyId, rating });
    if (r.success) toast.success('Rating saved!');
    else toast.error(r.error ?? 'Failed to save rating');
  }

  // Guards

  if (isLoading || inspectionLoading) return <PropertyDetailsSkeleton />;

  if (propError || !property) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-red-300" />
        <p className="font-primary font-semibold text-gray-700 text-lg">
          {(propError as Error)?.message ?? 'Property not found'}
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const status = STATUS_CONFIG[property.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = status?.icon ?? AlertCircle;

  const inspectionDaysLeft = inspection
    ? differenceInDays(new Date(inspection.expires_at), new Date())
    : null;

  const hasCommitted = inspection?.status === 'completed';
  const canInspect = isTenant && property.available_units > 0 && !inspection;
  const canPurchase =
    isTenant && !!inspection && inspection.status !== 'expired';

  // All images for the gallery
  const allImages = [property.feature_image, ...property.gallery].filter(
    Boolean
  );

  // Fee preview for sidebar — legal is +5% of base price (tenant-only opt-in)
  const basePrice = property.pricing.price;

  const propertyType = property?.listing_type as ListingType;

  const cautionfee = property?.pricing?.caution_fee ?? 0;

  const plan = {
    duration_months: property?.pricing?.instalment_plan?.duration_months ?? 0,
    interest_rate_percent:
      property?.pricing?.instalment_plan?.interest_rate_percent ?? 0,
    min_initial_payment_percent:
      property?.pricing?.instalment_plan?.min_initial_payment_percent ?? 0,
  };

  const isInstalment = Boolean(paymentPlan === 'instalment');

  const fullFees = calculateFees(
    basePrice,
    cautionfee,
    durationinterests,
    propertyType,
    legalServicesOpted,
    isInstalment,
    plan
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pt-6 pb-24">
      {/* Back */}
      <div className="flex items-center gap-3">
        <BrandButton
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-500 text-sm transition hover:text-gray-800"
        >
          {' '}
          Back
        </BrandButton>
        <BrandButton
          className="flex items-center gap-1.5 text-gray-500 text-sm transition hover:text-gray-800"
          leftIcon={<ChevronRight className="size-4" />}
        >
          Properties
        </BrandButton>
        <BrandButton
          className="flex items-center gap-1.5 text-gray-500 text-sm transition hover:text-gray-800"
          leftIcon={<ChevronRight className="size-4" />}
        >
          {property.title}
        </BrandButton>
      </div>

      <div className="relative">
        <PropertyGallery images={allImages} title={property.title} />

        {isTenant && (
          <BrandButton
            onClick={handleBookmark}
            disabled={bookmarkMutation.isPending}
            className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur transition hover:scale-110 disabled:opacity-60"
            leftIcon={
              <Heart
                className={cn(
                  'h-4 w-4',
                  bookmarkMutation.isSuccess
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-400'
                )}
              />
            }
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Title + badges */}
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-brand px-2.5 py-0.5 font-semibold text-white text-xs capitalize">
                {property.listing_type}
              </span>
              <span className="rounded-lg bg-gray-100 px-2.5 py-0.5 font-semibold text-gray-600 text-xs capitalize">
                {property.property_type}
              </span>
              {(isLandlord || isAdmin) && status && (
                <span
                  className={cn(
                    'flex items-center gap-1 rounded-lg px-2.5 py-0.5 font-semibold text-xs',
                    status.className
                  )}
                >
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </span>
              )}
            </div>
            <h1 className="font-bold font-primary text-2xl text-gray-900">
              {property.title}
            </h1>
            <div className="mt-1.5 flex items-center gap-1.5 text-gray-500 text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-brand-light" />
              {property.location.address}, {property.location.city},{' '}
              {property.location.state}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {[
              {
                icon: Bed,
                label: 'Beds',
                value: property.features.bedrooms,
                show: property.features.bedrooms > 0,
              },
              {
                icon: Bath,
                label: 'Baths',
                value: property.features.bathrooms,
                show: property.features.bathrooms > 0,
              },
              {
                icon: Maximize2,
                label: 'sqm',
                value: property.features.floor_area_sqm,
                show: property.features.floor_area_sqm > 0,
              },
              {
                icon: Eye,
                label: 'Views',
                value: property.views_count,
                show: true,
              },
              {
                icon: Heart,
                label: 'Saved',
                value: property.bookmarks_count,
                show: true,
              },
            ]
              .filter(s => s.show)
              .map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 py-3 text-center"
                >
                  <Icon className="h-4 w-4 text-brand" />
                  <p className="font-bold font-primary text-base text-gray-800">
                    {value}
                  </p>
                  <p className="font-secondary text-gray-400 text-xs">
                    {label}
                  </p>
                </div>
              ))}
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-2 font-primary font-semibold text-base text-gray-900">
              About this property
            </h2>

            <div
              className="max-w-none [&>p:last-child]:mb-0 [&>p]:mb-4"
              dangerouslySetInnerHTML={{ __html: property.description }}
            />
          </div>

          <Separator />

          {/* Features grid */}
          <div>
            <h2 className="mb-3 font-primary font-semibold text-base text-gray-900">
              Features
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                {
                  label: 'Furnishing',
                  value: property.features.furnishing.replace('_', ' '),
                },
                {
                  label: 'Parking',
                  value: `${property.features.parking_spaces} space(s)`,
                },
                { label: 'Toilets', value: property.features.toilets },
                {
                  label: 'Max Duration',
                  value: `${property.max_duration_years} yr(s)`,
                },
                ...(property.features.floors
                  ? [{ label: 'Floors', value: property.features.floors }]
                  : []),
                ...(property.features.year_built
                  ? [
                      {
                        label: 'Year Built',
                        value: property.features.year_built,
                      },
                    ]
                  : []),
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border bg-white px-3 py-2.5"
                >
                  <p className="font-secondary text-gray-400 text-xs">
                    {label}
                  </p>
                  <p className="font-primary font-semibold text-gray-700 text-sm capitalize">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          {property.features.amenities.length > 0 && (
            <div>
              <h2 className="mb-3 font-primary font-semibold text-base text-gray-900">
                Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {property.features.amenities.map(a => {
                  const Icon = AMENITY_ICONS[a] ?? CheckCircle2;
                  return (
                    <span
                      key={a}
                      className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-gray-600 text-xs capitalize"
                    >
                      <Icon className="h-3 w-3 text-brand" />
                      {a.replace(/_/g, ' ')}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Utilities */}
          {property.features.utilities_included.length > 0 && (
            <div>
              <h2 className="mb-3 font-primary font-semibold text-base text-gray-900">
                Utilities Included
              </h2>
              <div className="flex flex-wrap gap-2">
                {property.features.utilities_included.map(u => (
                  <span
                    key={u}
                    className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 text-xs capitalize"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {u}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Video tour */}
          {property.video_tour_url && (
            <div>
              <h2 className="mb-3 font-primary font-semibold text-base text-gray-900">
                Video Tour
              </h2>
              <a
                href={property.video_tour_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-brand text-sm transition hover:bg-brand/10"
              >
                <Video className="h-4 w-4" /> Watch video tour
              </a>
            </div>
          )}

          {/* Proof of ownership — landlord/admin only */}
          {(isLandlord || isAdmin) && property.proof_of_ownership && (
            <div>
              <h2 className="mb-3 font-primary font-semibold text-base text-gray-900">
                Proof of Ownership
              </h2>
              <a
                href={property.proof_of_ownership}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border px-4 py-3 text-gray-600 text-sm transition hover:bg-gray-50"
              >
                <FileText className="h-4 w-4 text-brand" /> View document
              </a>
            </div>
          )}

          {property.location.latitude && property.location.longitude && (
            <BrandMap
              lat={property.location.latitude}
              lng={property.location.longitude}
            />
          )}

          {/* Rejection reason */}
          {isLandlord &&
            property.status === 'rejected' &&
            property.rejection_reason && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="font-primary font-semibold text-red-700 text-sm">
                    Rejection Reason
                  </p>
                </div>
                <p className="font-secondary text-red-600 text-sm">
                  {property.rejection_reason}
                </p>
              </div>
            )}

          {/* Inspection status */}
          {isTenant && inspection && (
            <div
              className={cn(
                'rounded-xl border p-4',
                inspection.status === 'expired'
                  ? 'border-red-100 bg-red-50'
                  : 'border-amber-100 bg-amber-50'
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <Clock
                  className={cn(
                    'h-4 w-4',
                    inspection.status === 'expired'
                      ? 'text-red-500'
                      : 'text-amber-600'
                  )}
                />
                <p
                  className={cn(
                    'font-primary font-semibold text-sm',
                    inspection.status === 'expired'
                      ? 'text-red-700'
                      : 'text-amber-700'
                  )}
                >
                  {inspection.status === 'expired'
                    ? 'Inspection Expired'
                    : 'Inspection Booked'}
                </p>
              </div>
              {inspection.status !== 'expired' &&
                inspectionDaysLeft !== null && (
                  <p className="font-secondary text-amber-600 text-sm">
                    {inspectionDaysLeft > 0
                      ? `${inspectionDaysLeft} day(s) left to commit`
                      : 'Commitment window closed today'}
                  </p>
                )}
              {inspection.status === 'expired' && (
                <p className="font-secondary text-red-600 text-sm">
                  Your inspection window has passed. You can book again.
                </p>
              )}
            </div>
          )}

          {/* Rating */}
          {isTenant && (
            <div>
              <h2 className="mb-2 font-primary font-semibold text-base text-gray-900">
                Rate this property
              </h2>
              <BrandStarRating
                interactive
                value={userRating}
                onChange={handleRate}
                size={24}
                showValue
              />
              {property.rating_count > 0 && (
                <p className="mt-1 font-secondary text-gray-400 text-xs">
                  {Number(property.rating_average).toFixed(1)} average from{' '}
                  {property.rating_count} review(s)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:col-span-1">
          <PropertySidebar
            property={property}
            isTenant={isTenant}
            isLandlord={isLandlord}
            isAdmin={isAdmin}
            canInspect={canInspect}
            canPurchase={canPurchase}
            hasCommitted={hasCommitted}
            inspection_id={inspection?.id}
            legalServicesOpted={legalServicesOpted}
            paymentPlan={paymentPlan}
            durationYears={durationinterests}
            fees={fullFees}
            inspectionFee={inspectionFees?.fee ?? 0}
            onToggleLegal={() => dispatch({ type: 'TOGGLE_LEGAL' })}
            onSetPaymentPlan={plan =>
              dispatch({ type: 'SET_PAYMENT_PLAN', plan })
            }
            onSetDuration={(years: number) =>
              dispatch({ type: 'SET_DURATION', duration: years })
            }
            onEditProperty={() =>
              router.push(`/admin/properties/${propertyId}/edit`)
            }
            onReviewProperty={() =>
              router.push(`/admin/properties/${propertyId}`)
            }
          />

          {/* Location */}
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="mb-3 font-primary font-semibold text-gray-800 text-sm">
              Location
            </h3>
            <div className="space-y-1 font-secondary text-gray-600 text-sm">
              <p>{property.location.address}</p>
              <p>
                {property.location.city}, {property.location.state}
              </p>
              <p>{property.location.lga} LGA</p>
              {property.location.landmark && (
                <p className="text-gray-400">
                  Near: {property.location.landmark}
                </p>
              )}
            </div>
          </div>

          {/* Published info */}
          {property.published_at && (
            <div className="rounded-2xl border bg-white p-4">
              <p className="font-secondary text-gray-400 text-xs">
                Listed {TimeInterval(property.published_at)}
              </p>
              {property.approved_at && (
                <p className="font-secondary text-gray-400 text-xs">
                  Approved{' '}
                  {format(new Date(property.approved_at), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <PropertyPaymentModal userEmail={property.user_profiles?.email ?? ''} />
    </div>
  );
}

// Skeleton

function PropertyDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pt-6">
      <div className="h-72 w-full animate-pulse rounded-2xl bg-linear-to-br from-gray-100 via-slate-200 to-gray-100" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-linear-to-br from-gray-100 via-slate-200 to-gray-100" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-linear-to-br from-gray-100 via-slate-200 to-gray-100" />
          <div className="h-32 animate-pulse rounded-xl bg-linear-to-br from-gray-100 via-slate-200 to-gray-100" />
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-linear-to-br from-gray-100 via-slate-200 to-gray-100" />
      </div>
    </div>
  );
}
