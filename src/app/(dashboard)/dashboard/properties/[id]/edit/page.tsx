import { EditProperty } from '@/property';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="p-3 md:p-4">
      <EditProperty propertyId={id} />
    </div>
  );
}
