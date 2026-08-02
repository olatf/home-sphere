import { getUserProfile } from '@/actions/auth';
import { AdminTenantsPage } from '@/admin';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function TenantsPage() {
  const admin = await createAdminClient();

  const { data } = await getUserProfile();

  const role = data?.role;

  // Fetch admin team for task assignment dropdown
  const { data: adminRoles } = await admin
    .from('user_roles')
    .select('user_id, role')
    .in('role', ['admin', 'superAdmin', 'administrator']);

  const adminIds = (adminRoles ?? []).map(r => r.user_id);

  const { data: adminProfiles } = await admin
    .from('user_profiles')
    .select('id, full_name')
    .in('id', adminIds);

  const availableAdmins = (adminRoles ?? []).map(r => ({
    id: r.user_id,
    full_name:
      adminProfiles?.find(p => p.id === r.user_id)?.full_name ?? 'Unknown',
    role: r.role,
  }));

  return (
    <div className="p-3">
      <AdminTenantsPage
        availableAdmins={availableAdmins}
        currentUserRole={role}
      />
    </div>
  );
}
