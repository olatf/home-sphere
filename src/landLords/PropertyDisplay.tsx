'use client';

import { Filter, LayoutGrid, List, Loader2, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useReducer } from 'react';
import { toast } from 'sonner';
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
import {
  useDeleteProperty,
  useLandlordProperties,
  usePublishProperty,
} from '@/hooks/useProperty';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';
import { PropertyCard } from '@/property/';
import type { Property, PropertyStatus } from '@/types/property';
import { LandlordPropertyListItem } from './LandlordPropertyListItem';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Properties' },
  { value: 'draft', label: 'Drafts' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'revised', label: 'Revised' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

interface UIState {
  page: number;
  statusFilter: string;
  search: string;
  view: 'grid' | 'list';
}

type UIAction =
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_STATUS'; status: string }
  | { type: 'SET_SEARCH'; search: string }
  | { type: 'SET_VIEW'; view: 'grid' | 'list' };

function reducer(s: UIState, a: UIAction): UIState {
  switch (a.type) {
    case 'SET_PAGE':
      return { ...s, page: a.page };
    case 'SET_STATUS':
      return { ...s, statusFilter: a.status, page: 1 };
    case 'SET_SEARCH':
      return { ...s, search: a.search, page: 1 };
    case 'SET_VIEW':
      return { ...s, view: a.view };
    default:
      return s;
  }
}

export const LandlordPropertyDisplay = () => {
  const router = useRouter();
  const { profile, isLoading: ProfileLoading } = useUserProfile();

  const userId = !ProfileLoading ? profile.id : '';

  const [{ page, statusFilter, search, view }, dispatch] = useReducer(reducer, {
    page: 1,
    statusFilter: 'all',
    search: '',
    view: 'grid',
  });

  const { data, isLoading } = useLandlordProperties({
    status:
      statusFilter !== 'all' ? (statusFilter as PropertyStatus) : undefined,
    page,
    limit: 12,
  });

  const publishMutation = usePublishProperty();
  const deleteMutation = useDeleteProperty();

  const properties = (data?.data ?? []) as Property[];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const filtered = search.trim()
    ? properties.filter(
        p =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.location.city.toLowerCase().includes(search.toLowerCase())
      )
    : properties;

  async function handlePublish(id: string) {
    const r = await publishMutation.mutateAsync(id);
    if (r.success) toast.success('Submitted for review!');
    else toast.error(r.error);
  }

  async function handleDelete(id: string) {
    const r = await deleteMutation.mutateAsync(id);
    if (r.success) toast.success('Draft deleted');
    else toast.error(r.error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-bold font-primary text-2xl text-gray-900">
            My Properties
          </h1>
          <p className="mt-0.5 font-secondary text-gray-500 text-sm">
            {total} propert{total === 1 ? 'y' : 'ies'} total
          </p>
        </div>
        <BrandButton
          variant="secondary"
          onClick={() => router.push('/dashboard/properties')}
        >
          <Plus className="mr-1 size-4" /> Add Property
        </BrandButton>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <BrandInput
            name="search"
            placeholder="Search properties..."
            value={search}
            onChange={(val: FormValue) =>
              dispatch({ type: 'SET_SEARCH', search: val as string })
            }
            leftElement={<Search className="size-4 text-gray-400" />}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={v => dispatch({ type: 'SET_STATUS', status: v })}
        >
          <SelectTrigger className="w-44">
            <Filter className="mr-2 h-3.5 w-3.5 text-gray-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex overflow-hidden rounded-lg border">
          <BrandButton
            onClick={() => dispatch({ type: 'SET_VIEW', view: 'grid' })}
            className={cn(
              'px-3 py-2 transition',
              view === 'grid'
                ? 'bg-brand text-white'
                : 'text-gray-400 hover:bg-gray-50'
            )}
            leftIcon={<LayoutGrid className="size-4" />}
          />

          <BrandButton
            onClick={() => dispatch({ type: 'SET_VIEW', view: 'list' })}
            className={cn(
              'px-3 py-2 transition',
              view === 'list'
                ? 'bg-brand text-white'
                : 'text-gray-400 hover:bg-gray-50'
            )}
            leftIcon={<List className="size-4" />}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
            <Plus className="h-7 w-7 text-brand" />
          </div>
          <p className="font-primary font-semibold text-gray-700 text-lg">
            No properties yet
          </p>
          <p className="font-secondary text-gray-400 text-sm">
            Add your first property to get started
          </p>
          <BrandButton
            className="bg-brand hover:bg-brand-dark"
            onClick={() => router.push('/dashboard/properties')}
          >
            Add Property
          </BrandButton>
        </div>
      ) : (
        <div
          className={cn(
            view === 'grid'
              ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-4'
          )}
        >
          {filtered.map(p => {
            const isOwner = p.landlord_id === userId;
            return view === 'grid' ? (
              <div key={p.id} className="group relative my-3">
                <PropertyCard
                  isLandLord={isOwner}
                  property={p}
                  showStatus
                  href={`/properties/${p.id}`}
                />
                {/* Quick-action overlay slides up on hover */}
                <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-2 rounded-b-2xl bg-white px-4 py-2 shadow-lg transition-all group-hover:translate-y-0">
                  <BrandButton
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() =>
                      router.push(`/dashboard/properties/${p.id}/edit`)
                    }
                  >
                    Edit
                  </BrandButton>
                  {p.status === 'draft' && (
                    <>
                      <BrandButton
                        size="sm"
                        className="flex-1 bg-brand text-xs hover:bg-brand-dark"
                        disabled={publishMutation.isPending}
                        onClick={() => handlePublish(p.id)}
                      >
                        Publish
                      </BrandButton>
                      <BrandButton
                        size="sm"
                        variant="outline"
                        className="text-red-500 text-xs hover:bg-red-50"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </BrandButton>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <LandlordPropertyListItem
                key={p.id}
                property={p}
                publishing={publishMutation.isPending}
                deleting={deleteMutation.isPending}
                onPublish={handlePublish}
                onDelete={handleDelete}
                onEdit={id => router.push(`/dashboard/properties/${id}/edit`)}
                onView={id => router.push(`/properties/${id}`)}
              />
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={p => dispatch({ type: 'SET_PAGE', page: p })}
        />
      )}
    </div>
  );
};
