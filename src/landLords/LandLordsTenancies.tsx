'use client';

import { Loader2, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandInput, type FormValue } from '@/components/common/BrandInput';
import { baseClass } from '@/config/constants';
import { useLandlordTenants } from '@/hooks/useTenants';
import { cn } from '@/lib/utils';
import { type CardDetails, SummaryInfoCard } from '@/task';
import { TenantCard } from './TenantsCard';

export interface Tenant {
  id: string;
  status: string;
  listing_type: string;
  duration_years: number;
  start_date?: string;
  end_date?: string;
  total_amount: number;
  landlord_payout: number;
  legal_services_opted: boolean;
  payment_plan: string;
  created_at: string;
  properties?: { title: string; feature_image: string };
  user_profiles?: {
    full_name: string;
    email: string;
    avatar_url?: string;
    phone?: string;
  };
}

const STATUS_TABS = [
  'all',
  'inspection_paid',
  'committed',
  'active',
  'expired',
] as const;

interface LandlordTenanciesProps {
  propertyId?: string;
}

export const LandlordTenancies = ({ propertyId }: LandlordTenanciesProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useLandlordTenants(propertyId);
  const tenants = (data?.data ?? []) as Tenant[];

  const filtered = tenants
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .filter(t => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.user_profiles?.full_name?.toLowerCase().includes(q) ||
        t.user_profiles?.email?.toLowerCase().includes(q) ||
        t.properties?.title?.toLowerCase().includes(q)
      );
    });

  // Summary counts
  const counts = tenants.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  const CardDetails: CardDetails[] = [
    {
      label: 'Inspections',
      value: counts.inspection_paid ?? 0,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Committed',
      value: counts.committed ?? 0,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active',
      value: counts.active ?? 0,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Expired',
      value: counts.expired ?? 0,
      color: 'text-gray-500',
      bg: 'bg-gray-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold font-primary text-2xl text-gray-900">
          Tenants
        </h1>
        <p className="mt-0.5 font-secondary text-gray-500 text-sm">
          {tenants.length} total tenant record{tenants.length !== 1 ? 's' : ''}
        </p>
      </div>
      <SummaryInfoCard cardDetails={CardDetails} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <BrandInput
            name="search"
            placeholder="Search by name, email or property..."
            value={search}
            className={baseClass}
            onChange={(val: FormValue) => setSearch(val as string)}
            leftElement={<Search className="size-4 text-gray-400" />}
          />
        </div>

        <div className="flex gap-1 overflow-x-auto rounded-lg border p-1">
          {STATUS_TABS.map(s => (
            <BrandButton
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'shrink-0 rounded-md px-3 py-1.5 font-medium text-xs capitalize transition',
                statusFilter === s
                  ? 'bg-brand text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </BrandButton>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <Users className="h-10 w-10 text-gray-200" />
          <p className="font-medium font-primary text-gray-500 text-sm">
            No tenants found
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <TenantCard key={t.id} tenant={t} />
          ))}
        </div>
      )}
    </div>
  );
};
