import { getAdminInspections, getAdminTenants } from '@/actions/admin';
import { getAvailableUsers, getUserProfile } from '@/actions/auth';
import { adminGetAllProperties } from '@/actions/property';
import { AdminTaskOrganizer } from '@/admin';
import type { Role } from '@/lib/accessPolice';
import type { AdminInspection, AdminTenant } from '@/types/adminTenancy';

export default async function AdminTaskPage() {
  const [{ data }, usersRes, propertiesRes, inspectionsRes, tenanciesRes] =
    await Promise.all([
      getUserProfile(),
      getAvailableUsers(),
      adminGetAllProperties(),
      getAdminInspections(),
      getAdminTenants(),
    ]);

  if (!usersRes.success || !propertiesRes.success) {
    return <div className="p-4 text-red-500">Failed to load data</div>;
  }

  const currentUserId = data?.id ?? '';
  const currentUserRole = data?.role as Role;

  const tenants = (tenanciesRes.data ?? []) as AdminTenant[];
  const inspections = (inspectionsRes.data ?? []) as AdminInspection[];

  const referenceData = {
    inspections: inspections.map(i => ({
      id: i.id,
      title: `${i.properties?.title ?? 'No Property'} — ${i.user_profiles?.full_name ?? 'Unknown'}`,
    })),

    tenancies: tenants.map(t => ({
      id: t.id,
      title: `${t.properties?.title ?? 'No Property'} — ${t.user_profiles?.full_name ?? 'Unknown'}`,
    })),

    properties: (propertiesRes.data ?? []).map(p => ({
      id: p.id,
      title: p.title ?? 'Untitled Property',
    })),
  };

  return (
    <div className="p-3 md:p-4">
      <AdminTaskOrganizer
        userData={{ currentUserId, currentUserRole }}
        availableUsers={usersRes.data ?? []}
        referenceData={referenceData}
      />
    </div>
  );
}
