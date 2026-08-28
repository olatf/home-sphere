'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTask,
  forwardTask,
  getMyTasks,
  updateTaskChecklist,
  updateTaskStatus,
} from '@/actions/tasks';

type MyTasksResult = Awaited<ReturnType<typeof getMyTasks>>;
type MyTask = NonNullable<MyTasksResult['data']>[number];

import { QUERY_KEYS } from '@/config/property';
import type {
  ChecklistItem,
  CreateTaskFormData,
  ForwardTaskFormData,
} from '@/lib/schemas/property';

export function useMyTasks(filters?: {
  status?: string;
  priority?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.myTasks(filters),
    queryFn: () => getMyTasks(filters),
    staleTime: 30_000,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskFormData) => createTask(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-tasks'] }),
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      status,
      notes,
    }: {
      taskId: string;
      status: 'in_progress' | 'completed' | 'cancelled' | 'in_review';
      notes?: string;
    }) => updateTaskStatus(taskId, status, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-tasks'] }),
  });
}

export function useUpdateTaskChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      checklist,
    }: {
      taskId: string;
      checklist: ChecklistItem[];
    }) => updateTaskChecklist(taskId, checklist),
    onMutate: async ({ taskId, checklist }) => {
      await qc.cancelQueries({ queryKey: ['my-tasks'] });
      const prev = qc.getQueriesData({ queryKey: ['my-tasks'] });
      qc.setQueriesData(
        { queryKey: ['my-tasks'] },
        (old: MyTasksResult | undefined) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map((t: MyTask) =>
              t.id === taskId ? { ...t, checklist } : t
            ),
          };
        }
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueriesData({ queryKey: ['my-tasks'] }, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['my-tasks'] }),
  });
}

export function useForwardTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ForwardTaskFormData) => forwardTask(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-tasks'] }),
  });
}
