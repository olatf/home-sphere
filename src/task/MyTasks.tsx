'use client';

import { isPast } from 'date-fns';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  Send,
} from 'lucide-react';
import { useReducer } from 'react';
import { toast } from 'sonner';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandInput, type FormValue } from '@/components/common/BrandInput';
import { Pagination } from '@/components/common/Pagination';
import { useMyTasks, useUpdateTaskStatus } from '@/hooks/useTask';
import type { ChecklistItem } from '@/lib/schemas/property';
import { cn } from '@/lib/utils';
import { TaskCard } from './TaskCard';

export interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date?: string;
  notes?: string;
  assigned_to: string;
  assigned_by: string;
  reference_table: string;
  created_at: string;
  completed_at?: string;
  review_note?: string;
  checklist?: ChecklistItem[];
  properties?: { id: string; title: string } | null;
  user_profiles?: { full_name: string; email: string } | null;
}

export const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    cardBorder: string;
    badge: string;
  }
> = {
  pending: {
    label: 'Pending',
    icon: Clock,
    cardBorder: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
  },
  in_progress: {
    label: 'In Progress',
    icon: ArrowRight,
    cardBorder: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
  },
  in_review: {
    label: 'Submitted for Review',
    icon: Send,
    cardBorder: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    cardBorder: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  cancelled: {
    label: 'Cancelled',
    icon: AlertCircle,
    cardBorder: 'border-red-100',
    badge: 'bg-red-100 text-red-500',
  },
  forwarded: {
    label: 'Forwarded',
    icon: ArrowRight,
    cardBorder: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-600',
  },
};

export const PRIORITY_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  low: { label: 'Low', className: 'bg-gray-100 text-gray-500' },
  medium: { label: 'Medium', className: 'bg-blue-100 text-blue-600' },
  high: { label: 'High', className: 'bg-amber-100 text-amber-700' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-600' },
};

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

interface UIState {
  page: number;
  statusFilter: string;
  search: string;
}
type UIAction =
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_STATUS'; status: string }
  | { type: 'SET_SEARCH'; search: string };

function reducer(s: UIState, a: UIAction): UIState {
  switch (a.type) {
    case 'SET_PAGE':
      return { ...s, page: a.page };
    case 'SET_STATUS':
      return { ...s, statusFilter: a.status, page: 1 };
    case 'SET_SEARCH':
      return { ...s, search: a.search, page: 1 };
    default:
      return s;
  }
}

export const MyTasks = ({ currentUserId }: { currentUserId?: string }) => {
  const [{ page, statusFilter, search }, dispatch] = useReducer(reducer, {
    page: 1,
    statusFilter: 'all',
    search: '',
  });

  const { data, isLoading } = useMyTasks({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
  });

  const statusMutation = useUpdateTaskStatus();

  const tasks = (data?.data ?? []) as TaskRow[];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const filtered = search.trim()
    ? tasks.filter(
        t =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.properties?.title.toLowerCase().includes(search.toLowerCase())
      )
    : tasks;

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const inReviewCount = tasks.filter(t => t.status === 'in_review').length;
  const overdueCount = tasks.filter(
    t =>
      t.due_date &&
      isPast(new Date(t.due_date)) &&
      !['completed', 'cancelled', 'in_review'].includes(t.status)
  ).length;

  async function handleStatusUpdate(
    taskId: string,
    status: 'in_progress' | 'in_review' | 'cancelled',
    notes?: string
  ) {
    const r = await statusMutation.mutateAsync({ taskId, status, notes });
    if (r.success) {
      const msg =
        status === 'in_progress'
          ? 'Task started!'
          : status === 'in_review'
            ? 'Submitted for review.'
            : 'Task cancelled.';
      toast.success(msg);
    } else {
      toast.error(r.error ?? 'Failed to update task');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold font-primary text-2xl text-gray-900">
          My Tasks
        </h1>
        <p className="mt-0.5 font-secondary text-gray-500 text-sm">
          {total} task{total !== 1 ? 's' : ''} assigned to you
        </p>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: 'Pending',
            value: pendingCount,
            bg: 'bg-gray-50',
            color: 'text-gray-700',
          },
          {
            label: 'In Progress',
            value: inProgressCount,
            bg: 'bg-blue-50',
            color: 'text-blue-700',
          },
          {
            label: 'In Review',
            value: inReviewCount,
            bg: 'bg-amber-50',
            color: 'text-amber-700',
          },
          {
            label: 'Overdue',
            value: overdueCount,
            bg: 'bg-red-50',
            color: 'text-red-600',
          },
        ].map(s => (
          <div key={s.label} className={cn('rounded-xl px-4 py-3', s.bg)}>
            <p className={cn('font-bold font-primary text-2xl', s.color)}>
              {s.value}
            </p>
            <p className="font-secondary text-gray-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* How it works hint */}
      <div className="flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
        <Send className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
        <p className="font-secondary text-brand text-xs leading-relaxed">
          Work through your tasks and tick off each checklist item as you go.
          Submit for review when everything is done — the reviewer will mark it
          complete.
        </p>
      </div>

      {/* Status tabs */}
      <div className="scrollbar-none flex gap-1 overflow-x-auto rounded-xl border bg-gray-50 p-1">
        {STATUS_TABS.map(t => (
          <BrandButton
            key={t.value}
            onClick={() => dispatch({ type: 'SET_STATUS', status: t.value })}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 font-medium text-xs transition',
              statusFilter === t.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {t.label}
          </BrandButton>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <BrandInput
          name="search"
          placeholder="Search by task title or property..."
          value={search}
          onChange={(val: FormValue) =>
            dispatch({ type: 'SET_SEARCH', search: val as string })
          }
          leftElement={<Search className="size-4 text-gray-400" />}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <CheckCircle2 className="h-10 w-10 text-gray-200" />
          <p className="font-medium font-primary text-gray-500 text-sm">
            {search ? 'No tasks match your search' : 'No tasks here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              currentUserId={currentUserId}
              statusPending={statusMutation.isPending}
              onStatusUpdate={handleStatusUpdate}
            />
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
