'use client';

import {
  Bath,
  Bed,
  Clock,
  Eye,
  Heart,
  MapPin,
  Maximize2,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { toggleBookmark } from '@/actions/tenancy';
import { formatCurrency } from '@/helpers/currency.helpers';
import { useInspectionFees } from '@/hooks/useProperty';
import { cn } from '@/lib/utils';
import type { Property } from '@/types/property';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600' },
  pending_review: {
    label: 'Pending Review',
    className: 'bg-amber-100 text-amber-700',
  },
  revised: { label: 'Revised', className: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-600' },
  suspended: { label: 'Suspended', className: 'bg-orange-100 text-orange-700' },
};

interface PropertyCardProps {
  property: Property;
  isLandLord: boolean;
  isBookmarked?: boolean;
  showStatus?: boolean;
  href?: string;
}

export const PropertyCard = ({
  property,
  isBookmarked: init = false,
  isLandLord = false,
  showStatus = false,
  href,
}: PropertyCardProps) => {
  const [bookmarked, setBookmarked] = useState(init);
  const [toggling, setToggling] = useState(false);
  const status = STATUS_CONFIG[property.status];

  const { data: fees, isLoading: inspectionLoading } = useInspectionFees();

  const inspectionFees = property?.property_type
    ? fees?.find(f => f.property_type === property?.property_type)
    : null;

  async function handleBookmark(e: React.MouseEvent) {
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    const res = await toggleBookmark(property.id);
    if (res.success) {
      setBookmarked(res.bookmarked ?? false);
      toast.success(
        res.bookmarked ? 'Added to wishlist' : 'Removed from wishlist'
      );
    }
    setToggling(false);
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition',
        href && 'hover:border-brand-light hover:shadow-md'
      )}
    >
      {href && (
        <Link
          href={href}
          aria-label={property.title}
          className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-brand-primary focus-visible:outline-offset-2"
        />
      )}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={property.feature_image}
          alt={property.title}
          fill
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="rounded-lg bg-brand px-2.5 py-0.5 font-semibold text-white text-xs capitalize">
            {property.listing_type}
          </span>
          {showStatus && (
            <span
              className={cn(
                'rounded-lg px-2.5 py-0.5 font-semibold text-xs',
                status.className
              )}
            >
              {status.label}
            </span>
          )}
        </div>

        {!isLandLord && (
          <button
            type="button"
            onClick={handleBookmark}
            className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110"
          >
            <Heart
              className={cn(
                'h-4 w-4 transition',
                bookmarked ? 'fill-red-500 text-red-500' : 'text-gray-400'
              )}
            />
          </button>
        )}

        {property.available_units === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <span className="rounded-xl bg-white px-4 py-1.5 font-semibold text-gray-800 text-sm">
              No Units Available
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="mb-1 line-clamp-1 font-primary font-semibold text-gray-900">
          {property.title}
        </h3>

        <div className="mb-3 flex items-center gap-1 text-gray-500 text-xs">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-light" />
          <span className="truncate">
            {property.location.city}, {property.location.state}
          </span>
        </div>

        <div className="mb-4 flex items-center gap-3 text-gray-500 text-xs">
          {property.features.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {property.features.bedrooms} bed
            </span>
          )}
          {property.features.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {property.features.bathrooms} bath
            </span>
          )}
          {property.features.floor_area_sqm > 0 && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" />
              {property.features.floor_area_sqm} sqm
            </span>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="font-bold font-primary text-brand text-lg">
              {formatCurrency(property.pricing.price)}
            </p>
            {property.listing_type !== 'sale' && (
              <p className="text-gray-400 text-xs">per year</p>
            )}
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            {property.rating_count > 0 && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                {Number(property.rating_average).toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {property.views_count}
            </span>
          </div>
        </div>

        {!inspectionLoading && inspectionFees && (
          <div className="mt-3 flex items-center gap-1 rounded-lg bg-brand/5 px-3 py-1.5 text-brand text-xs">
            <Clock className="h-3 w-3 shrink-0" />
            Inspection fee: {formatCurrency(inspectionFees?.fee ?? 0)}
          </div>
        )}
      </div>
    </div>
  );
};
