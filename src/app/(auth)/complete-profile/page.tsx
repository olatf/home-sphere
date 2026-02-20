import { CompleteProfileForm, SideDisplay } from '@/components/auth';
import { redirect } from 'next/navigation';

interface CompleteProfileProps {
  searchParams: Promise<{ email: string; mode?: string }>;
}
export default async function CompleteProfilePage({
  searchParams,
}: CompleteProfileProps) {
  const { email } = await searchParams;

  if (!email) {
    redirect('/sign-up');
  }

  return (
    <section className="mx-auto grid h-screen grid-cols-2 px-9 pt-10 md:max-w-6xl">
      <SideDisplay />
      <CompleteProfileForm email={email} />
    </section>
  );
}
