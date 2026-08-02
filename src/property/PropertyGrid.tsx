import { MapPin } from 'lucide-react';
import type { Property } from '@/types/property';
import { PropertyCard } from './PropertyCard';

interface PropertyGridProps {
  properties: Property[];
  bookmarkedIds?: string[];
  showStatus?: boolean;
  userId: string;
  hrefPrefix?: string;
  emptyMessage?: string;
}

export function PropertyGrid({
  properties,
  userId,
  bookmarkedIds = [],
  showStatus = false,
  hrefPrefix = '/properties',
  emptyMessage = 'No properties found.',
}: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <MapPin className="h-7 w-7 text-brand-light" />
        </div>
        <p className="font-medium font-primary text-gray-500 text-sm">
          {emptyMessage}
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map(p => {
        const isOwner = p.landlord_id === userId;

        return (
          <PropertyCard
            key={p.id}
            isLandLord={isOwner}
            property={p}
            isBookmarked={bookmarkedIds.includes(p.id)}
            showStatus={showStatus}
            href={`${hrefPrefix}/${p.id}`}
          />
        );
      })}
    </div>
  );
}
