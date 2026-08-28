import { getUser } from '@/actions/auth';
import { MyTasks } from '@/task';

export default async function TasksPage() {
  const user = await getUser();
  return (
    <div className="p-3 md:p-4">
      <MyTasks currentUserId={user?.id} />
    </div>
  );
}
