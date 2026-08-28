'use client';

import { format } from 'date-fns';
import { AlertCircle, Building2, Filter, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useReducer } from 'react';
import { Pagination } from '@/components/common/Pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/helpers/currency.helpers';
import { useAdminProperties } from '@/hooks/useProperty';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';
import type { PropertyStatus } from '@/types/property';
import { AdminPropertyActions } from './AdminPropertyActions';

export interface PropertyRow {
  id: string;
  title: string;
  status: string;
  listing_type: string;
  property_type: string;
  feature_image: string;
  created_at: string;
  published_at?: string;
  rejection_reason?: string;
  pricing: { price: number; inspection_fee: number };
  location: { city: string; state: string };
  available_units: number;
  user_profiles?: { full_name: string; email: string };
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  revised: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-600',
  suspended: 'bg-orange-100 text-orange-700',
};

const STATUS_OPTIONS = [
  ['all', 'All Properties'],
  ['pending_review', 'Pending Review'],
  ['approved', 'Approved'],
  ['rejected', 'Rejected'],
  ['revised', 'Revised'],
  ['draft', 'Draft'],
  ['suspended', 'Suspended'],
] as const;

interface UIState {
  page: number;
  statusFilter: string;
}

type UIAction =
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_STATUS'; status: string };

function reducer(s: UIState, a: UIAction): UIState {
  switch (a.type) {
    case 'SET_PAGE':
      return { ...s, page: a.page };
    case 'SET_STATUS':
      return { ...s, statusFilter: a.status, page: 1 };
    default:
      return s;
  }
}

export const AdminPropertiesView = () => {
  const [{ page, statusFilter }, dispatch] = useReducer(reducer, {
    page: 1,
    statusFilter: 'all',
  });

  const { data, isLoading } = useAdminProperties({
    status:
      statusFilter !== 'all' ? (statusFilter as PropertyStatus) : undefined,
    page,
  });

  const { profile, isLoading: isLoadingProfile } = useUserProfile();

  const role = !isLoadingProfile && profile.role;

  const properties = (data?.data ?? []) as PropertyRow[];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const pendingCount = properties.filter(
    p => p.status === 'pending_review'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-bold font-primary text-2xl text-gray-900">
            Properties
          </h1>
          <p className="mt-0.5 font-secondary text-gray-500 text-sm">
            {total} total propert{total === 1 ? 'y' : 'ies'}
          </p>
        </div>

        <Select
          value={statusFilter}
          onValueChange={v => dispatch({ type: 'SET_STATUS', status: v })}
        >
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-3.5 w-3.5 text-gray-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-amber-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {pendingCount} propert{pendingCount === 1 ? 'y' : 'ies'} awaiting
          review
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <Building2 className="h-10 w-10 text-gray-200" />
          <p className="font-medium font-primary text-gray-500 text-sm">
            No properties found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {properties.map(p => (
            <div
              key={p.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border bg-white p-4 transition hover:shadow-sm"
            >
              <Image
                src={p.feature_image}
                alt={p.title}
                width={80}
                height={64}
                className="h-16 w-20 shrink-0 rounded-xl object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex flex-wrap items-center gap-2">
                  <p className="truncate font-primary font-semibold text-gray-800">
                    {p.title}
                  </p>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 font-medium text-xs capitalize',
                      STATUS_COLORS[p.status] ?? ''
                    )}
                  >
                    {p.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="font-secondary text-gray-400 text-xs">
                  {p.location.city}, {p.location.state} · {p.property_type} ·{' '}
                  {p.listing_type}
                </p>
                <div className="mt-1 flex items-center gap-3 text-gray-400 text-xs">
                  <span className="font-primary font-semibold text-brand">
                    {formatCurrency(p.pricing.price)}
                  </span>
                  <span>by {p.user_profiles?.full_name ?? 'Unknown'}</span>
                  {p.published_at && (
                    <span>
                      Submitted{' '}
                      {format(new Date(p.published_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>

              <AdminPropertyActions property={p} role={role} />
            </div>
          ))}
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
