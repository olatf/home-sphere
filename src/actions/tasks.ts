'use server';

import consola from 'consola';
import { revalidatePath } from 'next/cache';
import { getErrorMessage } from '@/helpers/error.helpers';
import type {
  ChecklistItem,
  CreateTaskFormData,
  ForwardTaskFormData,
} from '@/lib/schemas/property';
import { createTaskSchema, forwardTaskSchema } from '@/lib/schemas/property';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { notifyTaskAssigned, notifyTaskForwarded } from './messages';

export async function createTask(data: CreateTaskFormData) {
  const supabase = await createClient();
  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const parsed = createTaskSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: getErrorMessage(parsed.error.message) };

  const { data: task, error } = await admin
    .from('tasks')
    .insert({
      title: parsed.data.title,
      description: parsed.data.description,
      assigned_to: parsed.data.assigned_to,
      assigned_by: user.id,
      priority: parsed.data.priority,
      due_date: parsed.data.due_date,
      attachments: parsed.data.attachments ?? [],
      context_id: parsed.data.context_id,
      reference_table: parsed.data.reference_table,
      checklist: (parsed.data.checklist ?? []).map(item => ({
        ...item,
        done: false,
      })),
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  const { data: assignee } = await admin
    .from('user_profiles')
    .select('email')
    .eq('id', parsed.data.assigned_to)
    .single();

  if (assignee) {
    await notifyTaskAssigned(
      parsed.data.assigned_to,
      assignee.email,
      parsed.data.title,
      task.id,
      parsed.data.priority,
      parsed.data.due_date
    );
  }

  revalidatePath('/admin/tasks');
  return { success: true, data: task };
}

export async function updateTaskChecklist(
  taskId: string,
  checklist: ChecklistItem[]
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('tasks')
    .update({ checklist, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('assigned_to', user.id); // assignee can only update their own tasks

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/tasks');
  return { success: true };
}

export async function updateTaskStatus(
  taskId: string,
  status: 'in_progress' | 'completed' | 'cancelled' | 'in_review',
  notes?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('tasks')
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...(notes ? { notes } : {}),
      ...(status === 'completed'
        ? { completed_at: new Date().toISOString() }
        : {}),
    })
    .eq('id', taskId)
    .eq('assigned_to', user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/tasks');
  return { success: true };
}

export async function forwardTask(data: ForwardTaskFormData) {
  const supabase = await createClient();
  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const parsed = forwardTaskSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: getErrorMessage(parsed.error.message) };

  const { data: task } = await supabase
    .from('tasks')
    .select('title')
    .eq('id', parsed.data.task_id)
    .eq('assigned_to', user.id)
    .single();

  if (!task)
    return { success: false, error: 'Task not found or access denied' };

  const { error } = await admin
    .from('tasks')
    .update({
      assigned_to: parsed.data.forward_to,
      forwarded_from: user.id,
      status: 'forwarded',
      notes: parsed.data.reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.task_id);

  if (error) return { success: false, error: error.message };

  const { data: newAssignee } = await admin
    .from('user_profiles')
    .select('email')
    .eq('id', parsed.data.forward_to)
    .single();
  if (newAssignee) {
    await notifyTaskForwarded(
      parsed.data.forward_to,
      newAssignee.email,
      task.title,
      parsed.data.task_id,
      parsed.data.reason
    );
  }

  revalidatePath('/dashboard/tasks');
  return { success: true };
}

// export async function getMyTasks(filters?: {
//   status?: string;
//   priority?: string;
//   page?: number;
// }) {
//   const supabase = await createClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) return { success: false, data: null };

//   const page = filters?.page ?? 1;
//   const limit = 10;
//   const from = (page - 1) * limit;

//   let q = supabase
//     .from('tasks')
//     .select(
//       '*, properties(title,feature_image), user_profiles!assigned_by(full_name)',
//       { count: 'exact' }
//     )
//     .or(`assigned_to.eq.${user.id},assigned_by.eq.${user.id}`)
//     .order('created_at', { ascending: false })
//     .range(from, from + limit - 1);

//   if (filters?.status) q = q.eq('status', filters.status);
//   if (filters?.priority) q = q.eq('priority', filters.priority);

//   const { data, error, count } = await q;
//   if (error) {
//     consola.log(error);
//     return { success: false, data: null, error: error.message };
//   }

//   console.log

//   return {
//     success: true,
//     data,
//     total: count ?? 0,
//     totalPages: Math.ceil((count ?? 0) / limit),
//   };
// }

// export async function requestAccountDisable(userId: string, reason: string) {
//   const supabase = await createClient();
//   const admin = await createAdminClient();

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) return { success: false, error: 'Unauthorized' };

//   const { data: roleRow } = await admin
//     .from('user_roles')
//     .select('role')
//     .eq('user_id', user.id)
//     .single();

//   const role = roleRow?.role;

//   if (!['admin', 'superAdmin', 'administrator'].includes(role ?? ''))
//     return { success: false, error: 'Insufficient permissions' };

//   if (isSuperAdmin(role)) {
//     await admin.auth.admin.updateUserById(userId, { ban_duration: '87600h' });

//     const { data: target } = await admin
//       .from('user_profiles')
//       .select('email')
//       .eq('user_id', userId)
//       .single();

//     if (target) await notifyAccountSuspended(userId, target.email, reason);
//   } else {
//     await admin
//       .from('account_suspension_requests')
//       .insert({ target_user_id: userId, requested_by: user.id, reason });

//     const { data: superAdmins } = await admin
//       .from('user_roles')
//       .select('user_id')
//       .eq('role', 'superAdmin');

//     await Promise.all(
//       (superAdmins ?? []).map(sa =>
//         adminSendMessage(
//           sa.user_id,
//           'Account Suspension Request',
//           `An admin submitted a suspension request for user ${userId}.<br/><strong>Reason:</strong> ${reason}`
//         )
//       )
//     );
//   }

//   revalidatePath('/admin/users');
//   return { success: true };
// }

type ReferenceTable = 'properties' | 'tenancies' | 'inspections' | 'users';

interface ContextRecord {
  id: string;
  title: string;
  [key: string]: unknown;
}

interface ReferenceRow {
  title?: string | null;
  full_name?: string | null;
  email?: string | null;
  properties?: { title?: string | null } | null;
  user_profiles?: { full_name?: string | null } | null;
}

const REFERENCE_CONFIG: Record<
  ReferenceTable,
  {
    select: string;
    getTitle: (row: ReferenceRow) => string;
  }
> = {
  properties: {
    select: 'id, title, feature_image',
    getTitle: r => r.title ?? 'Untitled property',
  },
  tenancies: {
    select:
      'id, listing_type, status, properties(title), user_profiles!tenant_id(full_name)',
    getTitle: r =>
      `${r.properties?.title ?? 'No property'} — ${r.user_profiles?.full_name ?? 'Unknown tenant'}`,
  },
  inspections: {
    select: 'id, status, properties(title), user_profiles!tenant_id(full_name)',
    getTitle: r =>
      `${r.properties?.title ?? 'No property'} — ${r.user_profiles?.full_name ?? 'Unknown tenant'}`,
  },
  users: {
    select: 'id, full_name, email',
    getTitle: r => r.full_name ?? r.email ?? 'Unknown user',
  },
};

async function _resolveContext(
  contextId: string,
  referenceTable: ReferenceTable
): Promise<ContextRecord | null> {
  const cfg = REFERENCE_CONFIG[referenceTable];
  if (!cfg) return null;

  const admin = await createAdminClient();

  const table = referenceTable === 'users' ? 'user_profiles' : referenceTable;

  const { data, error } = await admin
    .from(table)
    .select(cfg.select)
    .eq('id', contextId)
    .single();

  if (error || !data) return null;

  const row = data as unknown as ContextRecord;

  return {
    ...row,
    id: contextId,
    title: cfg.getTitle(row),
  };
}

async function resolveContexts(
  tasks: { context_id: string | null; reference_table: string | null }[]
): Promise<Map<string, ContextRecord>> {
  const result = new Map<string, ContextRecord>();

  // Tasks without a context_id or reference_table — nothing to resolve
  const resolvable = tasks.filter(
    (t): t is { context_id: string; reference_table: string } =>
      !!t.context_id && !!t.reference_table
  );
  if (!resolvable.length) return result;

  // Group by reference_table so we do one query per table
  const groups = resolvable.reduce<Record<string, string[]>>((acc, t) => {
    const table = t.reference_table as ReferenceTable;
    if (!acc[table]) acc[table] = [];
    acc[table].push(t.context_id);
    return acc;
  }, {});

  const admin = await createAdminClient();

  await Promise.all(
    Object.entries(groups).map(async ([tableKey, ids]) => {
      const refTable = tableKey as ReferenceTable;
      const cfg = REFERENCE_CONFIG[refTable];
      if (!cfg) return;

      const dbTable = refTable === 'users' ? 'user_profiles' : refTable;

      const { data, error } = await admin
        .from(dbTable)
        .select(cfg.select)
        .in('id', ids);

      if (error || !data) return;

      for (const dbRow of data) {
        const row = dbRow as unknown as ContextRecord;
        result.set(row.id, {
          ...row,
          id: row.id,
          title: cfg.getTitle(row),
        });
      }
    })
  );

  return result;
}

export async function getMyTasks(filters?: {
  status?: string;
  priority?: string;
  page?: number;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, data: null, error: 'Unauthorized' };

  const page = filters?.page ?? 1;
  const limit = 10;
  const from = (page - 1) * limit;

  let q = supabase
    .from('tasks')
    .select(
      `
        *,
        user_profiles!assigned_by ( full_name, email, avatar_url )
      `,
      { count: 'exact' }
    )
    .or(`assigned_to.eq.${user.id},assigned_by.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (filters?.status) q = q.eq('status', filters.status);
  if (filters?.priority) q = q.eq('priority', filters.priority);

  const { data: tasks, error, count } = await q;

  if (error) {
    consola.error('getMyTasks error:', error);
    return { success: false, data: null, error: error.message };
  }

  if (!tasks?.length) {
    return { success: true, data: [], total: 0, totalPages: 0 };
  }

  const contextMap = await resolveContexts(tasks);
  const enriched = tasks.map(task => ({
    ...task,
    context: task.context_id ? (contextMap.get(task.context_id) ?? null) : null,
  }));

  return {
    success: true,
    data: enriched,
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}
