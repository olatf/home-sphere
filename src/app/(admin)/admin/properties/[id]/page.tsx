import { getUserProfile } from '@/actions/auth';
import { AdminPropertyDetails } from '@/admin';

interface PropertyDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function AdminPropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const { id } = await params;

  const { data: userData } = await getUserProfile();
  const role = userData?.role;

  return (
    <div className="p-3 md:p-4">
      <AdminPropertyDetails propertyId={id} role={role} />
    </div>
  );
}
