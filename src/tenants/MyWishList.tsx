'use client';

import { Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { BrandButton } from '@/components/common/BrandButton';
import { useTenantBookmarks, useToggleBookmark } from '@/hooks/useTenants';
import { useUserProfile } from '@/hooks/useUserProfile';
import { PropertyCard } from '@/property/';
import type { Property } from '@/types/property';

interface BookmarkRow {
  id: string;
  property_id: string;
  created_at: string;
  properties: Property;
}

export const MyWishList = () => {
  const { data, isLoading } = useTenantBookmarks();
  const toggleMutation = useToggleBookmark();

  const { profile, isLoading: profileLoading } = useUserProfile();

  const bookmarks = (data?.data ?? []) as BookmarkRow[];

  async function handleRemove(propertyId: string) {
    await toggleMutation.mutateAsync(propertyId);
    toast.success('Removed from wishlist');
  }

  if (isLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold font-primary text-2xl text-gray-900">
          My Wishlist
        </h1>
        <p className="mt-0.5 font-secondary text-gray-500 text-sm">
          {bookmarks.length} saved propert{bookmarks.length === 1 ? 'y' : 'ies'}
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <Heart className="h-7 w-7 text-red-300" />
          </div>
          <p className="font-primary font-semibold text-base text-gray-700">
            No saved properties
          </p>
          <p className="font-secondary text-gray-400 text-sm">
            Tap the heart icon on any property to save it here.
          </p>
          <Link
            href="/dashboard"
            className="mt-2 rounded-xl bg-brand px-5 py-2.5 font-semibold text-sm text-white transition hover:bg-brand-dark"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks
            .filter(b => b.properties !== null)
            .map(b => {
              const userId = profileLoading ? '' : profile.id;
              const isOwner = b.properties.landlord_id === userId;

              return (
                <div key={b.id} className="relative">
                  <PropertyCard
                    property={b.properties}
                    isLandLord={isOwner}
                    isBookmarked
                    href={`/properties/${b.property_id}`}
                  />
                  <BrandButton
                    onClick={() => handleRemove(b.property_id)}
                    disabled={toggleMutation.isPending}
                    className="rounded-full bg-white/90 shadow backdrop-blur transition hover:scale-110 disabled:opacity-50"
                    leftIcon={<Heart className="size-4 text-red-500" />}
                  />
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};
