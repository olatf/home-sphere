'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BrandAvatar } from '@/components/common/BrandAvatar';
import { BrandButton } from '@/components/common/BrandButton';
import { formatCurrency } from '@/helpers/currency.helpers';
import { useAdminOverview } from '@/hooks/useAdminActions';
import { hasPermission, type Role } from '@/lib/accessPolice';
import { cn } from '@/lib/utils';
import { OverviewStatCard } from './OverviewCards';

interface AdminOverviewProps {
  role: Role;
}

type Property = {
  id: number;
  title: string;
  created_at: string;
  status: string;
};

type User = {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
};

function PropertyRow({ p }: { p: Property }) {
  const STATUS_COLORS: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-700',
    pending_review: 'bg-amber-100 text-amber-700',
    draft: 'bg-gray-100 text-gray-600',
    rejected: 'bg-red-100 text-red-600',
    suspended: 'bg-orange-100 text-orange-700',
  };
  return (
    <div className="flex items-center gap-3 border-gray-200 border-b py-2.5 last:border-0">
      <Building2 className="h-4 w-4 shrink-0 text-gray-300" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-secondary text-gray-800 text-sm">
          {p.title}
        </p>
        <p className="font-secondary text-gray-400 text-xs">
          {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
        </p>
      </div>
      <span
        className={cn(
          'shrink-0 rounded-full px-2 py-0.5 font-medium text-xs capitalize',
          STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-500'
        )}
      >
        {p.status.replace('_', ' ')}
      </span>
    </div>
  );
}

function UserRow({ u }: { u: User }) {
  const name = u.full_name ?? u.email ?? '—';
  return (
    <div className="flex items-center gap-3 py-2.5">
      <BrandAvatar value={name} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-secondary text-gray-800 text-sm">
          {u.full_name ?? '—'}
        </p>
        <p className="truncate font-secondary text-gray-400 text-xs">
          {u.email}
        </p>
      </div>
      <p className="shrink-0 font-secondary text-gray-400 text-xs">
        {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
      </p>
    </div>
  );
}

export function AdminOverviewPage({ role }: AdminOverviewProps) {
  const router = useRouter();
  const { data, isLoading } = useAdminOverview();
  const stats = data?.data;

  const isSuperAdmin = hasPermission(role, 'superAdmin:access');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold font-primary text-2xl text-gray-900">
          Overview
        </h1>
        <p className="mt-1 font-secondary text-gray-500 text-sm">
          Organisation performance at a glance
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <OverviewStatCard
          label="Total Properties"
          value={stats?.properties.total ?? 0}
          sub={`${stats?.properties.pending ?? 0} pending review`}
          icon={Building2}
          color="bg-brand/10 text-brand"
          onClick={() => router.push('/admin/properties')}
        />
        <OverviewStatCard
          label="Active Tenancies"
          value={stats?.activeTenancies ?? 0}
          icon={CheckCircle2}
          color="bg-emerald-100 text-emerald-600"
          onClick={() => router.push('/admin/tenants')}
        />
        <OverviewStatCard
          label="Landlords"
          value={stats?.users.landlords ?? 0}
          icon={ShieldCheck}
          color="bg-blue-100 text-blue-600"
          onClick={() => router.push('/admin/users')}
        />
        <OverviewStatCard
          label="Tenants"
          value={stats?.users.tenants ?? 0}
          icon={Users}
          color="bg-purple-100 text-purple-600"
          onClick={() => router.push('/admin/users')}
        />
        <OverviewStatCard
          label="Total Inspections"
          value={stats?.inspections ?? 0}
          icon={Eye}
          color="bg-amber-100 text-amber-600"
          onClick={() => router.push('/admin/tenants')}
        />
        {isSuperAdmin && (
          <OverviewStatCard
            label="Total Revenue"
            value={formatCurrency(stats?.totalRevenue ?? 0)}
            sub="Landlord payouts issued"
            icon={TrendingUp}
            color="bg-emerald-100 text-emerald-600"
          />
        )}

        <OverviewStatCard
          label="Approved Properties"
          value={stats?.properties.approved ?? 0}
          sub={`${stats?.properties.pending ?? 0} awaiting`}
          icon={CheckCircle2}
          color="bg-brand/10 text-brand"
        />
        <OverviewStatCard
          label="Pending Review"
          value={stats?.properties.pending ?? 0}
          icon={Clock}
          color="bg-amber-100 text-amber-700"
          onClick={() => router.push('/admin/properties')}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-primary font-semibold text-base text-gray-900">
              Recent Properties
            </h2>
            <BrandButton
              variant="outline"
              onClick={() => router.push('/admin/properties')}
              className="font-secondary text-brand text-xs hover:underline"
            >
              View all →
            </BrandButton>
          </div>
          <div className="divide-y">
            {(stats?.recentProperties ?? []).map((p: Property) => (
              <PropertyRow key={p.id} p={p} />
            ))}
            {!stats?.recentProperties?.length && (
              <p className="py-6 text-center font-secondary text-gray-400 text-sm">
                No properties yet
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-primary font-semibold text-base text-gray-900">
              Recent Signups
            </h2>
            <BrandButton
              type="button"
              onClick={() => router.push('/admin/users')}
              className="font-secondary text-brand text-xs hover:underline"
            >
              View all →
            </BrandButton>
          </div>
          <div className="divide-y">
            {(stats?.recentUsers ?? []).map((u: User) => (
              <UserRow key={u.id} u={u} />
            ))}
            {!stats?.recentUsers?.length && (
              <p className="py-6 text-center font-secondary text-gray-400 text-sm">
                No users yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
