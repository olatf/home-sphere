'use client';

import { formatDistanceToNow } from 'date-fns';
import { Crown, Loader2, Search, ShieldCheck, Users } from 'lucide-react';
import { useReducer } from 'react';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandInput, type FormValue } from '@/components/common/BrandInput';
import { Pagination } from '@/components/common/Pagination';
import { formatCurrency } from '@/helpers/currency.helpers';
import { useAdminUsers } from '@/hooks/useAdminActions';
import { cn } from '@/lib/utils';
import { AdminUserDetails } from './AdminUserDetails';

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'tenant', label: 'Tenants' },
  { value: 'landlord', label: 'Landlords' },
  { value: 'admin', label: 'Admins' },
  { value: 'superAdmin', label: 'Super Admins' },
  { value: 'administrator', label: 'Administrators' },
];

export const ROLE_COLORS: Record<string, string> = {
  tenant: 'bg-purple-100 text-purple-700',
  landlord: 'bg-blue-100 text-blue-700',
  admin: 'bg-amber-100 text-amber-700',
  superAdmin: 'bg-brand/10 text-brand',
  administrator: 'bg-emerald-100 text-emerald-700',
};

export const VERIFICATION_STATUS_COLORS: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-500',
  pending: 'bg-amber-100 text-amber-600',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
};

interface UIState {
  page: number;
  search: string;
  roleFilter: string;
  selectedId: string;
  showSuspend: boolean;
  suspendReason: string;
}

type UIAction =
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_SEARCH'; search: string }
  | { type: 'SET_ROLE'; role: string }
  | { type: 'SELECT'; id: string }
  | { type: 'CLOSE_DETAIL' }
  | { type: 'OPEN_SUSPEND' }
  | { type: 'CLOSE_SUSPEND' }
  | { type: 'SET_REASON'; reason: string };

function reducer(s: UIState, a: UIAction): UIState {
  switch (a.type) {
    case 'SET_PAGE':
      return { ...s, page: a.page };
    case 'SET_SEARCH':
      return { ...s, search: a.search, page: 1 };
    case 'SET_ROLE':
      return { ...s, roleFilter: a.role, page: 1 };
    case 'SELECT':
      return { ...s, selectedId: a.id, showSuspend: false };
    case 'CLOSE_DETAIL':
      return { ...s, selectedId: '' };
    case 'OPEN_SUSPEND':
      return { ...s, showSuspend: true };
    case 'CLOSE_SUSPEND':
      return { ...s, showSuspend: false, suspendReason: '' };
    case 'SET_REASON':
      return { ...s, suspendReason: a.reason };
    default:
      return s;
  }
}

type AdminUserRow = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  user_roles: {
    role: string;
  }[];
  wallets: { balance: number }[];
  verification_status: string;
};

function UserRow({
  user,
  onSelect,
}: {
  user: AdminUserRow;
  onSelect: () => void;
}) {
  const role = user.user_roles?.[0]?.role ?? 'tenant';
  const initials = (user.full_name ?? user.email ?? '?')[0].toUpperCase();

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex w-full items-center gap-4 rounded-xl p-3 text-left transition hover:bg-gray-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 font-bold text-brand text-sm">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-primary font-semibold text-gray-800 text-sm">
            {user.full_name ?? '—'}
          </p>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-semibold text-[10px] capitalize',
              ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-500'
            )}
          >
            {role}
          </span>
          {user.verification_status === 'approved' && (
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          )}
        </div>
        <p className="truncate font-secondary text-gray-400 text-xs">
          {user.email}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-secondary text-gray-400 text-xs">
          {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
        </p>
        {user.wallets?.[0]?.balance !== undefined && (
          <p className="font-medium font-secondary text-emerald-600 text-xs">
            {formatCurrency(user.wallets[0].balance)}
          </p>
        )}
      </div>
    </button>
  );
}

interface AdminUsersPageProps {
  currentUserRole: string;
}

export function AdminUsersPage({ currentUserRole }: AdminUsersPageProps) {
  const [state, dispatch] = useReducer(reducer, {
    page: 1,
    search: '',
    roleFilter: 'all',
    selectedId: '',
    showSuspend: false,
    suspendReason: '',
  });

  const { page, search, roleFilter, selectedId } = state;

  const { data, isLoading } = useAdminUsers({ search, role: roleFilter, page });
  const users = (data?.data ?? []) as AdminUserRow[];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Separate admin members from regular users
  const adminRoles = ['admin', 'superAdmin', 'administrator'];
  const adminMembers = users.filter(u =>
    adminRoles.includes(u.user_roles?.[0]?.role)
  );
  const regularUsers = users.filter(
    u => !adminRoles.includes(u.user_roles?.[0]?.role)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-bold font-primary text-2xl text-gray-900">Users</h1>
        <p className="mt-1 font-secondary text-gray-500 text-sm">
          {total.toLocaleString()} total users
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-52 flex-1">
          <BrandInput
            name="search"
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(value: FormValue) => {
              const rawValue = value?.toString() ?? '';
              dispatch({ type: 'SET_SEARCH', search: rawValue });
            }}
            leftElement={<Search className="size-4" />}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-xl border bg-gray-50 p-1">
          {ROLE_OPTIONS.map(r => (
            <BrandButton
              key={r.value}
              onClick={() => dispatch({ type: 'SET_ROLE', role: r.value })}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 font-medium text-xs transition',
                roleFilter === r.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {r.label}
            </BrandButton>
          ))}
        </div>
      </div>

      {(roleFilter === 'all' || adminRoles.includes(roleFilter)) &&
        adminMembers.length > 0 && (
          <div className="rounded-2xl border bg-white">
            <div className="border-b px-5 py-4">
              <h2 className="flex items-center gap-2 font-primary font-semibold text-base text-gray-900">
                <Crown className="h-4 w-4 text-brand" /> Admin Members
              </h2>
              <p className="mt-0.5 font-secondary text-gray-400 text-xs">
                {currentUserRole === 'superAdmin'
                  ? 'Click a user to upgrade or downgrade their role.'
                  : 'Admin team members.'}
              </p>
            </div>
            <div className="divide-y px-2 py-2">
              {adminMembers.map(u => (
                <UserRow
                  key={u.id}
                  user={u}
                  onSelect={() => dispatch({ type: 'SELECT', id: u.id })}
                />
              ))}
            </div>
          </div>
        )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <Users className="h-10 w-10 text-gray-200" />
          <p className="font-medium font-primary text-gray-500 text-sm">
            No users found
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-white">
          <div className="border-b px-5 py-4">
            <h2 className="font-primary font-semibold text-base text-gray-900">
              All Users
            </h2>
          </div>
          <div className="divide-y px-2 py-2">
            {(roleFilter === 'all' ? regularUsers : users).map(u => (
              <UserRow
                key={u.id}
                user={u}
                onSelect={() => dispatch({ type: 'SELECT', id: u.id })}
              />
            ))}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={p => dispatch({ type: 'SET_PAGE', page: p })}
        />
      )}

      {selectedId && (
        <AdminUserDetails
          userId={selectedId}
          currentUserRole={currentUserRole}
          onClose={() => dispatch({ type: 'CLOSE_DETAIL' })}
        />
      )}
    </div>
  );
}
