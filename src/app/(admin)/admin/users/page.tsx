import { getUserProfile } from '@/actions/auth';
import { AdminUsersPage } from '@/admin';

export default async function UsersPage() {
  const { data } = await getUserProfile();

  const role = data?.role;

  return (
    <div className="p-3">
      <AdminUsersPage currentUserRole={role} />
    </div>
  );
}
