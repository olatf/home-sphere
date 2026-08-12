'use client';

import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { useReducer } from 'react';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandInput, type FormValue } from '@/components/common/BrandInput';
import { Pagination } from '@/components/common/Pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { capitalize } from '@/helpers/formatters.helpers';
import { useApprovedProperties } from '@/hooks/useProperty';
import { useTenantBookmarks } from '@/hooks/useTenants';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';
import { PropertyGrid } from '@/property';
import type { Property } from '@/types/property';

type Tab = 'all' | 'rent' | 'lease' | 'sale' | 'notification';

interface State {
  tab: Tab;
  page: number;
  search: string;
  propertyType: string;
  showFilters: boolean;
}
type Action =
  | { type: 'SET_TAB'; tab: Tab }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_SEARCH'; search: string }
  | { type: 'SET_TYPE'; value: string }
  | { type: 'TOGGLE_FILTERS' }
  | { type: 'RESET' };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'SET_TAB':
      return { ...s, tab: a.tab, page: 1 };
    case 'SET_PAGE':
      return { ...s, page: a.page };
    case 'SET_SEARCH':
      return { ...s, search: a.search, page: 1 };
    case 'SET_TYPE':
      return { ...s, propertyType: a.value, page: 1 };
    case 'TOGGLE_FILTERS':
      return { ...s, showFilters: !s.showFilters };
    case 'RESET':
      return { ...s, search: '', propertyType: 'all', page: 1 };
    default:
      return s;
  }
}

export const PropertiesListingPage = ({
  maxshow = 12,
  showMoreButton = false,
}: {
  maxshow?: number;
  showMoreButton?: boolean;
}) => {
  const [state, dispatch] = useReducer(reducer, {
    tab: 'all',
    page: 1,
    search: '',
    propertyType: 'all',
    showFilters: false,
  });
  const { tab, page, search, propertyType, showFilters } = state;

  const filters = {
    listing_type: tab !== 'all' ? tab : undefined,
    property_type: propertyType !== 'all' ? propertyType : undefined,
    search: search || undefined,
    page,
    limit: maxshow,
  };

  const { data: propData, isLoading } = useApprovedProperties(filters);
  const { data: bookmarkData } = useTenantBookmarks();
  const { profile, isLoading: profileLoading } = useUserProfile();

  const properties = (propData?.data ?? []) as Property[];
  const totalPages = propData?.totalPages ?? 0;
  const total = propData?.total ?? 0;
  const userId = profileLoading ? '' : profile?.id;

  interface BookmarkItem {
    property_id: string;
  }

  const bookmarkedIds = (bookmarkData?.data ?? []).map(
    (b: BookmarkItem) => b.property_id
  );

  const hasFilters = search || propertyType !== 'all';

  return (
    <>
      <div className="mx-3 w-full space-y-6 md:mx-auto md:max-w-5xl xl:max-w-7xl">
        <div>
          <h1 className="font-bold font-primary text-2xl text-gray-900">
            Find a Property
          </h1>
          <p className="mt-0.5 font-secondary text-gray-500 text-sm">
            {total > 0 ? `${total} available` : 'Searching...'}
          </p>
        </div>

        <div className="flex gap-1 overflow-x-auto rounded-xl border bg-gray-50 p-1">
          {(['all', 'rent', 'lease', 'sale'] as Tab[]).map(t => (
            <BrandButton
              key={t}
              onClick={() => dispatch({ type: 'SET_TAB', tab: t })}
              className={cn(
                'flex-1 shrink-0 rounded-lg py-2 font-medium text-sm capitalize transition',
                tab === t
                  ? 'bg-brand text-white'
                  : 'border-none bg-transparent text-gray-500 hover:bg-gray-100'
              )}
            >
              {t === 'all' ? 'All' : `For ${capitalize(t.replace('_', ' '))}`}
            </BrandButton>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <BrandInput
              name="search"
              placeholder="Search by title, city..."
              value={search}
              onChange={(value: FormValue) => {
                const rawValue = value as string;

                dispatch({ type: 'SET_SEARCH', search: rawValue });
              }}
              leftElement={<Search className="size-4 text-gray-400" />}
            />
          </div>
          <BrandButton
            variant="outline"
            onClick={() => dispatch({ type: 'TOGGLE_FILTERS' })}
            className={showFilters ? 'border-brand text-brand' : 'border'}
            leftIcon={<SlidersHorizontal className="size-4" />}
          >
            Filters
          </BrandButton>
        </div>

        <div className="flex w-full items-center justify-end">
          {showFilters && (
            <div className="items flex max-w-lg flex-wrap gap-3 rounded-xl border bg-gray-50 p-4">
              <Select
                value={propertyType}
                onValueChange={v => dispatch({ type: 'SET_TYPE', value: v })}
              >
                <SelectTrigger className="w-44 bg-white">
                  <SelectValue placeholder="Property type" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    ['all', 'All Types'],
                    ['apartment', 'Apartment'],
                    ['house', 'House'],
                    ['commercial', 'Commercial'],
                    ['land', 'Land'],
                    ['shortlet', 'Shortlet'],
                  ].map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasFilters && (
                <BrandButton
                  size="sm"
                  onClick={() => dispatch({ type: 'RESET' })}
                  leftIcon={<X className="size-3.5" />}
                >
                  Clear
                </BrandButton>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : (
          <>
            <PropertyGrid
              properties={properties}
              bookmarkedIds={bookmarkedIds}
              userId={userId}
              hrefPrefix="/properties"
              emptyMessage={
                hasFilters
                  ? 'No properties match your filters.'
                  : 'No properties available right now.'
              }
            />
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={p => dispatch({ type: 'SET_PAGE', page: p })}
              />
            )}
          </>
        )}
      </div>
      {showMoreButton && !!properties && (
        <div className="mx-auto mt-9 flex max-w-md items-center justify-center">
          <BrandButton asChild>
            <Link href="/properties">Explore More</Link>
          </BrandButton>
        </div>
      )}
    </>
  );
};

export const OverviewDashboard = PropertiesListingPage;
