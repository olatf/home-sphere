import { getUserProfile } from '@/actions/auth';
import { PropertyDetails } from '@/property';

interface PropertyDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const { id } = await params;

  const { data: userData } = await getUserProfile();
  const role = userData?.role;
  const userId = userData?.id;

  return (
    <div className="p-3 md:p-4">
      <PropertyDetails propertyId={id} role={role} userId={userId} />
    </div>
  );
}
