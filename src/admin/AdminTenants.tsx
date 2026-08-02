'use client';

import { differenceInDays } from 'date-fns';
import { Home, Loader2, Plus, Search } from 'lucide-react';
import { useReducer } from 'react';
import { toast } from 'sonner';
import { BrandAvatar } from '@/components/common/BrandAvatar';
import { BrandButton } from '@/components/common/BrandButton';
import type { FormValue } from '@/components/common/BrandInput';
import { BrandInput } from '@/components/common/BrandInput';
import { Pagination } from '@/components/common/Pagination';
import { formatCurrency } from '@/helpers/currency.helpers';
import { safeStr } from '@/helpers/data.helpers';
import { formatDateAndTime } from '@/helpers/date.helpers';
import { getErrorMessage } from '@/helpers/error.helpers';
import { useAdminInspections, useAdminTenants } from '@/hooks/useAdminActions';
import { useCreateTask } from '@/hooks/useTask';
import { useUpdateInspectionStatusMutation } from '@/hooks/useTenants';
import { hasPermission, type Role } from '@/lib/accessPolice';
import type { CreateTaskFormData } from '@/lib/schemas/property';
import { cn } from '@/lib/utils';
import type { AdminInspection, AdminTenant } from '@/types/adminTenancy';
import {
  INSPECTION_STATUS_CFG,
  INSPECTION_TABS,
  TENANCY_STATUS_CFG,
  TENANCY_TABS,
} from '@/types/adminTenancy';
import { CreateTaskDialog } from './CreateTaskDialog';

interface UIState {
  tab: 'tenancies' | 'inspections';
  page: number;
  search: string | null;
  statusFilter: string;
  taskDialog: {
    open: boolean;
    contextId: string;
    referenceTable: 'tenancies' | 'inspections' | '';
  };
}

type UIAction =
  | { type: 'SET_TAB'; tab: UIState['tab'] }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_SEARCH'; search: string }
  | { type: 'SET_STATUS'; status: string }
  | {
      type: 'OPEN_TASK';
      contextId: string;
      referenceTable: 'tenancies' | 'inspections';
    }
  | { type: 'CLOSE_TASK' };

function reducer(s: UIState, a: UIAction): UIState {
  switch (a.type) {
    case 'SET_TAB':
      return { ...s, tab: a.tab, page: 1, statusFilter: 'all' };
    case 'SET_PAGE':
      return { ...s, page: a.page };
    case 'SET_SEARCH':
      return { ...s, search: a.search, page: 1 };
    case 'SET_STATUS':
      return { ...s, statusFilter: a.status, page: 1 };
    case 'OPEN_TASK':
      return {
        ...s,
        taskDialog: {
          open: true,
          contextId: a.contextId,
          referenceTable: a.referenceTable,
        },
      };
    case 'CLOSE_TASK':
      return {
        ...s,
        taskDialog: { open: false, contextId: '', referenceTable: '' },
      };
    default:
      return s;
  }
}

interface AdminTenantsPageProps {
  availableAdmins: { id: string; full_name: string; role: string }[];
  currentUserRole: Role;
}

export function AdminTenantsPage({
  availableAdmins,
  currentUserRole,
}: AdminTenantsPageProps) {
  const [state, dispatch] = useReducer(reducer, {
    tab: 'tenancies',
    page: 1,
    search: '',
    statusFilter: 'all',
    taskDialog: { open: false, contextId: '', referenceTable: '' },
  });

  const { tab, page, search, statusFilter, taskDialog } = state;

  const searchValue = search ?? '';
  const tenantsQuery = useAdminTenants({
    search: searchValue,
    status: statusFilter,
    page,
  });
  const inspectionsQuery = useAdminInspections({
    search: searchValue,
    status: statusFilter,
    page,
  });

  const createMutation = useCreateTask();

  const updateInspectionStatusMutation = useUpdateInspectionStatusMutation();

  const tenants = (tenantsQuery.data?.data ?? []) as AdminTenant[];
  const inspections = (inspectionsQuery.data?.data ?? []) as AdminInspection[];
  const activeQuery = tab === 'tenancies' ? tenantsQuery : inspectionsQuery;
  const items = tab === 'tenancies' ? tenants : inspections;
  const totalPages = activeQuery.data?.totalPages ?? 0;
  const statusTabs = tab === 'tenancies' ? TENANCY_TABS : INSPECTION_TABS;

  const canAssignTasks = hasPermission(
    currentUserRole,
    'can-assign-tasks:access'
  );
  const canCancelInspections = hasPermission(
    currentUserRole,
    'can-manage-inspection:access'
  );

  const references = {
    tenancies: tenants.map(t => ({
      id: t.id,
      title: `${t.properties?.title ?? 'No Property'} — ${t.user_profiles?.full_name ?? 'Unknown'}`,
    })),
    inspections: inspections.map(i => ({
      id: i.id,
      title: `${i.properties?.title ?? 'No Property'} — ${i.user_profiles?.full_name ?? 'Unknown'}`,
    })),
  };

  async function handleTaskSubmit(data: CreateTaskFormData) {
    const r = await createMutation.mutateAsync(data);
    if (r.success) {
      toast.success('Task assigned successfully');
      dispatch({ type: 'CLOSE_TASK' });
    } else {
      toast.error(r.error ?? 'Failed to create task');
    }
  }

  const handleCancelInspection = async (
    inspectionId: string,
    newStatus: 'scheduled' | 'completed' | 'cancelled'
  ) => {
    try {
      await updateInspectionStatusMutation.mutateAsync({
        inspectionId,
        status: newStatus,
      });
      toast.success('Inspection was successfully Cancelled');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(`Failed to cancel inspection: ${errorMessage}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold font-primary text-2xl text-gray-900">
            Tenants
          </h1>
          <p className="mt-1 font-secondary text-gray-500 text-sm">
            Manage tenancies and inspection schedules
          </p>
        </div>

        {canAssignTasks && (
          <BrandButton
            type="button"
            onClick={() =>
              dispatch({
                type: 'OPEN_TASK',
                contextId: '',
                referenceTable: 'tenancies',
              })
            }
            leftIcon={<Plus className="size-4" />}
          >
            {' '}
            Assign Task
          </BrandButton>
        )}
      </div>

      <div className="flex overflow-hidden rounded-xl border">
        {(['tenancies', 'inspections'] as const).map(t => (
          <BrandButton
            key={t}
            onClick={() => dispatch({ type: 'SET_TAB', tab: t })}
            className={cn(
              'flex-1 py-2.5 font-medium text-sm capitalize transition',
              tab === t
                ? 'bg-brand text-white'
                : 'text-gray-500 hover:bg-gray-50'
            )}
          >
            {t}
          </BrandButton>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-52 flex-1">
          <BrandInput
            name="search"
            placeholder={`Search ${tab}...`}
            value={search ?? ''}
            onChange={(value: FormValue) => {
              const rawValue = value?.toString() ?? '';
              dispatch({ type: 'SET_SEARCH', search: rawValue });
            }}
            leftElement={<Search className="size-4" />}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-xl border bg-gray-50 p-1">
          {statusTabs.map(s => (
            <BrandButton
              key={s}
              onClick={() => dispatch({ type: 'SET_STATUS', status: s })}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 font-medium text-xs capitalize transition',
                statusFilter === s
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
            </BrandButton>
          ))}
        </div>
      </div>

      {activeQuery.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <Home className="h-10 w-10 text-gray-200" />
          <p className="font-medium font-primary text-gray-500 text-sm">
            No {tab} found
          </p>
        </div>
      ) : tab === 'tenancies' ? (
        <div className="space-y-3">
          {(items as AdminTenant[]).map(t => {
            const statusCfg =
              TENANCY_STATUS_CFG[t.status] ?? TENANCY_STATUS_CFG.expired;
            const daysLeft = t.end_date
              ? differenceInDays(new Date(t.end_date), new Date())
              : null;
            return (
              <div
                key={t.id}
                className="rounded-2xl border bg-white p-4 transition hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start gap-4">
                  <BrandAvatar
                    src={safeStr(t.user_profiles?.avatar)}
                    value={t.user_profiles?.full_name ?? ''}
                    style={t.user_profiles?.avatar ? 'image' : 'character'}
                    size={35}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                      <p className="font-primary font-semibold text-gray-800">
                        {t.user_profiles?.full_name}
                      </p>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 font-medium text-xs',
                          statusCfg.className
                        )}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="font-secondary text-gray-400 text-xs">
                      {t.user_profiles?.email}
                    </p>
                    {t.properties && (
                      <p className="mt-1 flex items-center gap-1 font-secondary text-gray-500 text-xs">
                        <Home className="h-3 w-3" /> {t.properties.title}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 space-y-1 text-right">
                    <p className="font-bold font-primary text-base text-brand">
                      {formatCurrency(t.total_amount)}
                    </p>
                    <p className="font-secondary text-gray-400 text-xs capitalize">
                      {t.listing_type} · {t.duration_years} yr(s)
                    </p>
                    {daysLeft !== null && daysLeft > 0 && daysLeft <= 30 && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 font-secondary text-amber-700 text-xs">
                        {daysLeft}d left
                      </span>
                    )}
                  </div>
                </div>

                {canAssignTasks && (
                  <div className="mt-3 flex justify-end border-t pt-3">
                    <BrandButton
                      onClick={() =>
                        dispatch({
                          type: 'OPEN_TASK',
                          contextId: t.id,
                          referenceTable: 'tenancies',
                        })
                      }
                      leftIcon={<Plus className="size-4" />}
                    >
                      {' '}
                      Assign Task
                    </BrandButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {(items as AdminInspection[]).map(i => {
            const hasSchedulesDate = i.scheduled_date !== null;
            const cfg =
              INSPECTION_STATUS_CFG[i.status] ?? INSPECTION_STATUS_CFG.pending;
            const Icon = cfg.icon;
            const daysLeft = i.expires_at
              ? differenceInDays(new Date(i.expires_at), new Date())
              : null;

            const isExpiredOrCancelled =
              i.status === 'expired' || i.status === 'cancelled';

            return (
              <div
                key={i.id}
                className="rounded-2xl border bg-white p-4 transition hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start gap-4">
                  {/* Status icon bubble */}
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      cfg.className
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex flex-wrap items-center gap-2">
                      <p className="font-primary font-semibold text-gray-800">
                        {i.user_profiles?.full_name}
                      </p>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 font-medium text-xs',
                          cfg.className
                        )}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <p className="font-secondary text-gray-400 text-xs">
                      {i.user_profiles?.email}
                    </p>
                    {i.properties && (
                      <p className="mt-1 flex items-center gap-1 font-secondary text-gray-500 text-xs">
                        <Home className="h-3 w-3" />
                        {i.properties.title} ·{' '}
                        <span className="capitalize">
                          {i.properties.property_type}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 space-y-1 text-right">
                    <p className="font-bold font-primary text-gray-700 text-sm">
                      {formatCurrency(i.inspection_fee)}
                    </p>
                    <p className="font-secondary text-gray-400 text-xs">
                      {formatDateAndTime(i.created_at).date}
                    </p>
                    {!isExpiredOrCancelled && daysLeft !== null && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 font-secondary text-xs',
                          daysLeft < 0
                            ? 'bg-red-50 text-red-500'
                            : daysLeft <= 3
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-gray-50 text-gray-500'
                        )}
                      >
                        {daysLeft < 0
                          ? 'Expired'
                          : daysLeft === 0
                            ? 'Expires today'
                            : `${daysLeft}d left`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  {hasSchedulesDate ? (
                    <p className="mt-3 px-5 font-secondary text-gray-500 text-sm">
                      Scheduled for{' '}
                      <span className="font-semibold">
                        Inspection has been scheduled for{' '}
                        {formatDateAndTime(i.scheduled_date).date} at{' '}
                        {formatDateAndTime(i.scheduled_date).time}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-3 px-5 font-secondary text-amber-500 text-sm">
                      No date scheduled yet, please set a date.
                    </p>
                  )}

                  <div>
                    {canAssignTasks && !i.has_committed_to_property && (
                      <div className="mt-3 flex items-center justify-end gap-2 border-t pt-3">
                        {canCancelInspections && hasSchedulesDate ? (
                          <BrandButton
                            className="bg-rose-500 text-white hover:bg-rose-600"
                            onClick={() =>
                              handleCancelInspection(i.id, 'cancelled')
                            }
                          >
                            Cancel Inspection
                          </BrandButton>
                        ) : (
                          <BrandButton
                            disabled={isExpiredOrCancelled}
                            // onClick={() => handleCancelInspection(i.id)}
                          >
                            Set Date
                          </BrandButton>
                        )}
                        {canAssignTasks && (
                          <BrandButton
                            onClick={() =>
                              dispatch({
                                type: 'OPEN_TASK',
                                contextId: i.id,
                                referenceTable: 'inspections',
                              })
                            }
                          >
                            <Plus className="mr-1.5 h-3.5 w-3.5" /> Assign Task
                          </BrandButton>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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

      <CreateTaskDialog
        availableUsers={availableAdmins}
        references={references}
        open={taskDialog.open}
        onOpenChange={o => !o && dispatch({ type: 'CLOSE_TASK' })}
        buttonText="Assign Task"
        createMutation={createMutation}
        contextId={taskDialog.contextId}
        referenceTable={taskDialog.referenceTable || undefined}
        onsubmit={handleTaskSubmit}
      />
    </div>
  );
}
