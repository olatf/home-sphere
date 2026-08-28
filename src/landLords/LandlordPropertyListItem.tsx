'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/helpers/currency.helpers';
import { cn } from '@/lib/utils';
import type { Property } from '@/types/property';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
  suspended: 'bg-orange-100 text-orange-700',
};

interface ListItemProps {
  property: Property;
  publishing: boolean;
  deleting: boolean;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

export const LandlordPropertyListItem = ({
  property,
  publishing,
  deleting,
  onPublish,
  onDelete,
  onEdit,
  onView,
}: ListItemProps) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-white p-4 transition hover:shadow-sm">
      <Image
        src={property.feature_image}
        alt={property.title}
        width={96}
        height={80}
        className="h-20 w-24 shrink-0 rounded-xl object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="truncate font-primary font-semibold text-gray-800">
            {property.title}
          </p>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-medium text-xs capitalize',
              STATUS_COLORS[property.status]
            )}
          >
            {property.status.replace('_', ' ')}
          </span>
        </div>
        <p className="truncate font-secondary text-gray-400 text-xs">
          {property.location.city}, {property.location.state}
        </p>
        <p className="mt-1 font-bold font-primary text-brand text-sm">
          {formatCurrency(property.pricing.price)}
          <span className="font-normal font-secondary text-gray-400 text-xs">
            /yr
          </span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => onView(property.id)}>
          View
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEdit(property.id)}>
          Edit
        </Button>
        {property.status === 'draft' && (
          <>
            <Button
              size="sm"
              className="bg-brand hover:bg-brand-dark"
              disabled={publishing}
              onClick={() => onPublish(property.id)}
            >
              Publish
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-500 hover:bg-red-50"
              disabled={deleting}
              onClick={() => onDelete(property.id)}
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
