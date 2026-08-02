'use server';

import type { QueryData } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function getAdminOverviewStats() {
  const admin = await createAdminClient();

  const [
    { count: totalProperties },
    { count: approvedProperties },
    { count: pendingProperties },
    { count: totalLandlords },
    { count: totalTenants },
    { count: totalAdmins },
    { count: totalInspections },
    { count: activeTenancies },
    { data: revenueData },
    { data: recentProperties },
    { data: recentUsers },
  ] = await Promise.all([
    admin.from('properties').select('*', { count: 'exact', head: true }),
    admin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),
    admin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_review'),
    admin
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'landlord'),
    admin
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'tenant'),
    admin
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .in('role', ['admin', 'superAdmin', 'administrator']),
    admin.from('inspections').select('*', { count: 'exact', head: true }),
    admin
      .from('tenancies')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    admin
      .from('wallet_transactions')
      .select('amount')
      .eq('transaction_type', 'landlord_payout')
      .eq('status', 'completed'),
    admin
      .from('properties')
      .select('id, title, status, created_at, pricing')
      .order('created_at', { ascending: false })
      .limit(5),
    admin
      .from('user_profiles')
      .select('id, full_name, email, avatar_url, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const totalRevenue = (revenueData ?? []).reduce(
    (sum, r) => sum + Number(r.amount),
    0
  );

  return {
    success: true,
    data: {
      properties: {
        total: totalProperties ?? 0,
        approved: approvedProperties ?? 0,
        pending: pendingProperties ?? 0,
      },
      users: {
        landlords: totalLandlords ?? 0,
        tenants: totalTenants ?? 0,
        admins: totalAdmins ?? 0,
      },
      inspections: totalInspections ?? 0,
      activeTenancies: activeTenancies ?? 0,
      totalRevenue,
      recentProperties: recentProperties ?? [],
      recentUsers: recentUsers ?? [],
    },
  };
}

// USERS

export async function getAdminUsers(opts?: {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}) {
  const admin = await createAdminClient();
  const page = opts?.page ?? 1;
  const limit = opts?.limit ?? 20;
  const from = (page - 1) * limit;

  let query = admin
    .from('user_profiles')
    .select(
      `
      id, full_name, email, avatar_url, phone,
      city, nationality, date_of_birth,
      verification_status, is_account_verified,
      is_documents_verified, is_live_verified,
      onboarding_completed, created_at,
      user_roles ( role ),
      wallets ( balance )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (opts?.search) {
    query = query.or(
      `full_name.ilike.%${opts.search}%,email.ilike.%${opts.search}%,phone.ilike.%${opts.search}%`
    );
  }

  const { data, error, count } = await query;
  if (error)
    return { success: false, error: error.message, data: null, total: 0 };

  // Filter by role client-side (Supabase doesn't allow filter on joined table easily)
  let filtered = data ?? [];
  if (opts?.role && opts.role !== 'all') {
    filtered = filtered.filter(u => u.user_roles?.[0]?.role === opts.role);
  }

  return {
    success: true,
    data: filtered,
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getUserDetail(userId: string) {
  const admin = await createAdminClient();

  const [
    { data: profile },
    { data: role },
    { data: wallet },
    { data: properties },
    { data: tenancies },
    { data: inspections },
    { data: transactions },
  ] = await Promise.all([
    admin.from('user_profiles').select('*').eq('id', userId).single(),
    admin.from('user_roles').select('role').eq('user_id', userId).single(),
    admin
      .from('wallets')
      .select('balance, total_deposit, total_spent')
      .eq('user_id', userId)
      .single(),
    admin
      .from('properties')
      .select('id, title, status, created_at, pricing')
      .eq('landlord_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    admin
      .from('tenancies')
      .select(
        'id, status, listing_type, total_amount, created_at, properties(title)'
      )
      .eq('tenant_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    admin
      .from('inspections')
      .select('id, status, inspection_fee, created_at, properties(title)')
      .eq('tenant_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
    admin
      .from('wallet_transactions')
      .select('id, type, amount, transaction_type, created_at, description')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return {
    success: true,
    data: {
      profile,
      role: role?.role,
      wallet,
      properties,
      tenancies,
      inspections,
      transactions,
    },
  };
}

export async function suspendUser(
  userId: string,
  reason: string,
  durationHours?: number
) {
  const supabase = await createClient();
  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const banDuration = durationHours ? `${durationHours}h` : '876000h'; // 100 years = permanent

  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: banDuration,
  });
  if (error) return { success: false, error: error.message };

  // Log suspension request
  await admin.from('account_suspension_requests').insert({
    target_user_id: userId,
    requested_by: user.id,
    reason,
    status: 'approved',
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  });

  revalidatePath('/admin/users');
  return { success: true };
}

export async function unsuspendUser(userId: string) {
  const admin = await createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  });
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient();
  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  // Only superAdmin can change roles
  const { data: myRole } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
  if (myRole?.role !== 'superAdmin')
    return { success: false, error: 'Only superAdmin can change roles' };

  const { error } = await admin
    .from('user_roles')
    .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/users');
  return { success: true };
}

const getAdminTenantsQuery = async () => {
  const admin = await createAdminClient();
  return admin.from('tenancies').select(`
    id, status, listing_type, duration_years,
    start_date, end_date, total_amount, legal_services_opted,
    payment_plan, created_at,
    properties ( id, title, location, feature_image ),
    user_profiles!tenant_id ( id, full_name, email, phone, avatar_url )
  `);
};

type AdminTenantsResponse = QueryData<ReturnType<typeof getAdminTenantsQuery>>;
type AdminTenant = AdminTenantsResponse[number];

export async function getAdminTenants(opts?: {
  search?: string;
  status?: string;
  page?: number;
}) {
  const admin = await createAdminClient();
  const page = opts?.page ?? 1;
  const limit = 20;
  const from = (page - 1) * limit;

  let query = admin
    .from('tenancies')
    .select(
      `
      id, status, listing_type, duration_years,
      start_date, end_date, total_amount, legal_services_opted,
      payment_plan, created_at,
      properties ( id, title, location, feature_image ),
      user_profiles!tenant_id ( id, full_name, email, phone, avatar_url )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (opts?.status && opts.status !== 'all') {
    query = query.eq('status', opts.status);
  }

  const { data, error, count } = await query;

  if (error)
    return {
      success: false,
      error: error.message,
      data: null,
      total: 0,
      totalPages: 0,
    };

  let filtered = (data as AdminTenantsResponse) ?? [];

  if (opts?.search) {
    const q = opts.search.toLowerCase();
    filtered = filtered.filter((t: AdminTenant) => {
      const profile = Array.isArray(t.user_profiles)
        ? t.user_profiles[0]
        : t.user_profiles;
      const property = Array.isArray(t.properties)
        ? t.properties[0]
        : t.properties;

      const fullName = profile?.full_name?.toLowerCase() ?? '';
      const email = profile?.email?.toLowerCase() ?? '';
      const propertyTitle = property?.title?.toLowerCase() ?? '';

      return (
        fullName.includes(q) || email.includes(q) || propertyTitle.includes(q)
      );
    });
  }

  return {
    success: true,
    data: filtered,
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getAdminInspections(opts?: {
  search?: string;
  status?: string;
  page?: number;
}) {
  const admin = await createAdminClient();
  const page = opts?.page ?? 1;
  const limit = 20;
  const from = (page - 1) * limit;

  let query = admin
    .from('inspections')
    .select(
      `
      id, status, inspection_fee, scheduled_date,
      expires_at, created_at, notes, has_committed_to_property,
      properties ( id, title, location, property_type ),
      user_profiles!tenant_id ( id, full_name, email, phone )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (opts?.status && opts.status !== 'all')
    query = query.eq('status', opts.status);

  const { data, error, count } = await query;
  if (error)
    return { success: false, error: error.message, data: null, total: 0 };

  let filtered = data ?? [];
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    filtered = filtered.filter(i => {
      const row = i as unknown as {
        user_profiles?: { full_name?: string | null } | null;
        properties?: { title?: string | null } | null;
      };
      return (
        row.user_profiles?.full_name?.toLowerCase().includes(q) ||
        row.properties?.title?.toLowerCase().includes(q)
      );
    });
  }

  return {
    success: true,
    data: filtered,
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function assignFollowUpTask(data: {
  title: string;
  description: string;
  assigned_to: string;
  priority: string;
  due_date?: string;
  property_id?: string;
  tenancy_id?: string;
}) {
  const supabase = await createClient();
  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await admin.from('tasks').insert({
    ...data,
    assigned_by: user.id,
    status: 'pending',
  });

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/tenants');
  return { success: true };
}

export async function updateAdminProfile(data: {
  full_name?: string;
  phone?: string;
  city?: string;
  bio?: string;
  avatar_url?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { error } = await supabase
    .from('user_profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', user.id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/admin/settings');
  return { success: true };
}

export async function changeAdminPassword(newPassword: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
