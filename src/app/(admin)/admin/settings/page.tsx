import { getUserProfile } from '@/actions/auth';
import { AdminSettingsPage } from '@/admin';

export default async function SettingsPage() {
  const { data } = await getUserProfile();

  const neededData = {
    id: data?.id,
    email: data?.email,
    full_name: data?.full_name,
    phone: data?.phone,
    city: data?.city,
    bio: data?.bio,
    avatar_url: data?.avatar_url,
    role: data?.role ?? 'admin',
  };

  return (
    <AdminSettingsPage
      currentUser={{
        ...neededData,
      }}
    />
  );
}
