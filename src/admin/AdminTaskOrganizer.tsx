'use client';

import { CheckCircle2, Filter, Loader2, Plus } from 'lucide-react';
import { useReducer, useState } from 'react';
import { toast } from 'sonner';
import { BrandButton } from '@/components/common/BrandButton';
import { Pagination } from '@/components/common/Pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateTask,
  useForwardTask,
  useMyTasks,
  useUpdateTaskStatus,
} from '@/hooks/useTask';
import { hasPermission, type Role } from '@/lib/accessPolice';
import type { CreateTaskFormData } from '@/lib/schemas/property';
import type { TaskRow } from '@/task/MyTasks';
import { TaskCard } from '@/task/TaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';

const STATUS_OPTIONS = [
  ['all', 'All Status'],
  ['pending', 'Pending'],
  ['in_progress', 'In Progress'],
  ['completed', 'Completed'],
  ['forwarded', 'Forwarded'],
  ['cancelled', 'Cancelled'],
] as const;

const PRIORITY_OPTIONS = [
  ['all', 'All Priority'],
  ['low', 'Low'],
  ['medium', 'Medium'],
  ['high', 'High'],
  ['urgent', 'Urgent'],
] as const;

interface UIState {
  page: number;
  statusFilter: string;
  priorityFilter: string;
}

type UIAction =
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_STATUS'; status: string }
  | { type: 'SET_PRIORITY'; priority: string };

function reducer(s: UIState, a: UIAction): UIState {
  switch (a.type) {
    case 'SET_PAGE':
      return { ...s, page: a.page };
    case 'SET_STATUS':
      return { ...s, statusFilter: a.status, page: 1 };
    case 'SET_PRIORITY':
      return { ...s, priorityFilter: a.priority, page: 1 };
    default:
      return s;
  }
}

interface AdminTasksPageProps {
  userData: {
    currentUserId: string;
    currentUserRole: Role;
  };
  availableUsers: { id: string; full_name: string; role: string }[];
  referenceData?: {
    tenancies: { id: string; title: string }[] | [];
    inspections: { id: string; title: string }[] | [];
    properties: { id: string; title: string }[] | [];
  };
}

export const AdminTaskOrganizer = ({
  userData,
  availableUsers,
  referenceData,
}: AdminTasksPageProps) => {
  const { currentUserId, currentUserRole } = userData;
  const [{ page, statusFilter, priorityFilter }, dispatch] = useReducer(
    reducer,
    {
      page: 1,
      statusFilter: 'all',
      priorityFilter: 'all',
    }
  );

  const { data, isLoading } = useMyTasks({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    page,
  });

  const statusMutation = useUpdateTaskStatus();
  const forwardMutation = useForwardTask();
  const createMutation = useCreateTask();

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const tasks = (data?.data ?? []) as TaskRow[];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  async function handleStatusUpdate(
    taskId: string,
    status: 'in_progress' | 'in_review' | 'cancelled',
    notes?: string
  ) {
    const r = await statusMutation.mutateAsync({ taskId, status, notes });
    if (r.success) toast.success(`Task marked as ${status.replace('_', ' ')}`);
    else toast.error(r.error);
  }

  const canAssignTasks = hasPermission(
    currentUserRole,
    'can-assign-tasks:access'
  );

  async function handleSubmit(data: CreateTaskFormData) {
    const r = await createMutation.mutateAsync(data);

    if (r.success) {
      toast.success('Task created');
    } else {
      toast.error(r.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-bold font-primary text-2xl text-gray-900">
            Tasks
          </h1>
          <p className="mt-0.5 font-secondary text-gray-500 text-sm">
            {total} task(s)
          </p>
        </div>

        {canAssignTasks && (
          <BrandButton variant="ghost" onClick={() => setTaskDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Assign Task
          </BrandButton>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={statusFilter}
          onValueChange={v => dispatch({ type: 'SET_STATUS', status: v })}
        >
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-3.5 w-3.5 text-gray-400" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter}
          onValueChange={v => dispatch({ type: 'SET_PRIORITY', priority: v })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <CheckCircle2 className="h-10 w-10 text-gray-200" />
          <p className="font-medium font-primary text-gray-500 text-sm">
            No tasks found
          </p>
        </div>
      ) : (
        <div className="grid w-full gap-4 sm:grid-cols-2">
          {tasks.map(t => (
            <TaskCard
              key={t.id}
              task={t}
              currentUserId={currentUserId}
              availableUsers={availableUsers}
              forwardMutation={forwardMutation}
              onStatusUpdate={handleStatusUpdate}
              statusPending={statusMutation.isPending}
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

      <CreateTaskDialog
        availableUsers={availableUsers}
        references={referenceData}
        open={taskDialogOpen}
        onOpenChange={o => !o && setTaskDialogOpen(false)}
        buttonText="Assign Task"
        createMutation={createMutation}
        // referenceTable={}
        onsubmit={handleSubmit}
      />
    </div>
  );
};
