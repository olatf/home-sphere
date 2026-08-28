'use client';

import { format } from 'date-fns';
import {
  AlertCircle,
  Bath,
  Bed,
  Car,
  CheckCircle2,
  ChevronLeft,
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
import { useRouter } from 'next/navigation';
import { useEffect, useReducer } from 'react';
import { BrandButton } from '@/components/common/BrandButton';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/helpers/currency.helpers';
import { TimeInterval } from '@/helpers/date.helpers';
import { useInspectionFees, useProperty } from '@/hooks/useProperty';
import { hasPermission, type Role } from '@/lib/accessPolice';
import { cn } from '@/lib/utils';
import { PropertyGallery } from '@/property';
import type { Property } from '@/types/property';
import { AdminPropertyActions } from './AdminPropertyActions';

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
  rejected: {
    label: 'Rejected',
    icon: AlertCircle,
    className: 'bg-red-100 text-red-600',
  },
  revised: {
    label: 'Revised',
    icon: ScanSearch,
    className: 'bg-amber-100 text-amber-700',
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

// State

interface UIState {
  activeImage: number;
  legalServicesProvided: boolean;
}

type UIAction =
  | { type: 'SET_IMAGE'; index: number }
  | { type: 'TOGGLE_LEGAL' }
  | { type: 'SET_LEGAL'; value: boolean };

function reducer(s: UIState, a: UIAction): UIState {
  switch (a.type) {
    case 'SET_IMAGE':
      return { ...s, activeImage: a.index };

    case 'TOGGLE_LEGAL':
      return { ...s, legalServicesProvided: !s.legalServicesProvided };

    case 'SET_LEGAL':
      return { ...s, legalServicesProvided: a.value };

    default:
      return s;
  }
}

interface PropertyDetailsPageProps {
  propertyId: string;
  role: Role;
}

export const AdminPropertyDetails = ({
  propertyId,
  role,
}: PropertyDetailsPageProps) => {
  const router = useRouter();

  const [{ legalServicesProvided }, dispatch] = useReducer(reducer, {
    activeImage: 0,
    legalServicesProvided: false,
  });

  const {
    data: propData,
    isLoading,
    error: propError,
  } = useProperty(propertyId);

  const { data: fees, isLoading: inspectionLoading } = useInspectionFees();

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

  useEffect(() => {
    if (property?.legal_services_available !== undefined) {
      dispatch({
        type: 'SET_LEGAL',
        value: property.legal_services_available,
      });
    }
  }, [property?.legal_services_available]);

  const inspectionFees = property?.property_type
    ? fees?.find(f => f.property_type === property?.property_type)
    : null;

  const isAdmin = hasPermission(role, 'admin:access');
  const CanManageProperty = hasPermission(role, 'manage-properties:access');

  // Guards

  if (isLoading || inspectionLoading) return <PropertyDetailsSkeleton />;

  if (propError || !property) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-red-300" />
        <p className="font-primary font-semibold text-gray-700 text-lg">
          {(propError as Error)?.message ?? 'Property not found'}
        </p>
        <BrandButton variant="outline" onClick={() => router.back()}>
          Go back
        </BrandButton>
      </div>
    );
  }

  const status = STATUS_CONFIG[property.status as keyof typeof STATUS_CONFIG];
  const StatusIcon = status?.icon ?? AlertCircle;

  // All images for the gallery
  const allImages = [property.feature_image, ...property.gallery].filter(
    Boolean
  );

  // Fee preview for sidebar — legal is +5% of base price (tenant-only opt-in)
  const basePrice = property.pricing.price;
  const platformFee = basePrice * 0.05;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pt-6 pb-24">
      {/* Back */}
      <div className="flex items-center gap-3">
        <BrandButton
          onClick={() => router.back()}
          variant="link"
          leftIcon={<ChevronLeft className="size-4" />}
        >
          {' '}
          Back
        </BrandButton>
        <BrandButton
          variant="outline"
          leftIcon={<ChevronRight className="size-4" />}
        >
          Properties
        </BrandButton>
        <BrandButton
          variant="outline"
          leftIcon={<ChevronRight className="size-4" />}
        >
          {property.title}
        </BrandButton>
      </div>

      <div className="relative">
        <PropertyGallery images={allImages} title={property.title} />
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
              {isAdmin && status && (
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
          {CanManageProperty && property.proof_of_ownership && (
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

          {/* Rejection reason */}
          {(property.status === 'rejected' || property.status === 'revised') &&
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
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            {/* Price */}
            <p className="font-bold font-primary text-2xl text-brand">
              {formatCurrency(property.pricing.price)}
            </p>
            {property.listing_type !== 'sale' && (
              <p className="font-secondary text-gray-400 text-xs">per year</p>
            )}

            <Separator className="my-4" />

            {/* Fee breakdown */}
            <div className="space-y-2 font-secondary text-sm">
              {property.pricing.caution_fee && (
                <div className="flex justify-between text-gray-600">
                  <span>Caution Fee</span>
                  <span>{formatCurrency(property.pricing.caution_fee)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Platform Fee (5%)</span>
                <span>{formatCurrency(platformFee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Inspection Fees</span>
                <span>{formatCurrency(inspectionFees?.fee ?? 0)}</span>
              </div>
            </div>

            {property.pricing.allows_instalment && (
              <div className="mt-3 rounded-lg bg-brand/5 px-3 py-2 text-brand text-xs">
                ✓ The Landlords accepts instalment payments for this property
              </div>
            )}

            {/* Available units */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-secondary text-gray-500">
                Available Units
              </span>
              <span
                className={cn(
                  'font-primary font-semibold',
                  property.available_units > 0
                    ? 'text-emerald-600'
                    : 'text-red-500'
                )}
              >
                {property.available_units}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-2">
            <div className="mt-4 space-y-2 rounded-xl border border-brand/20 bg-brand/5 p-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={legalServicesProvided}
                  onChange={e =>
                    dispatch({ type: 'SET_LEGAL', value: e.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 rounded border-brand text-brand accent-brand"
                />
                <div>
                  <p className="font-primary font-semibold text-gray-800 text-sm">
                    Legal Protection (+5%)
                  </p>
                  <p className="mt-0.5 font-secondary text-gray-500 text-xs">
                    This property is protected by a legal professional. If a
                    user opts for this on the checkout page, a 5% fee will be
                    added to the total.
                  </p>
                </div>
              </label>
            </div>
          </div>

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

          <div className="mx-1 mt-5 space-y-3">
            <AdminPropertyActions
              property={property}
              role={role}
              covered_by_legal_services={legalServicesProvided}
              buttonShowStyle="trad"
            />
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
    </div>
  );
};

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
