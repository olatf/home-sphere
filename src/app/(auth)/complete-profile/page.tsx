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
    <section className="mx-auto grid h-screen grid-cols-1 px-3 pt-9 md:max-w-6xl md:grid-cols-2 md:px-9 md:pt-10">
      <SideDisplay />
      <CompleteProfileForm email={email} />
    </section>
  );
}
