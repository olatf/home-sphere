import { ResetPasswordForm, SideDisplay } from '@/components/auth';
import { redirect } from 'next/navigation';

interface resetPasswordProps {
  searchParams: Promise<{ email: string; mode?: string }>;
}
export default async function ResetpasswordPage({
  searchParams,
}: resetPasswordProps) {
  const { email } = await searchParams;

  if (!email) {
    redirect('/sign-up');
  }

  return (
    <section className="mx-auto my-3 grid h-screen max-w-6xl overflow-hidden bg-transparent px-3 md:my-10 md:px-7 lg:grid-cols-2">
      <SideDisplay />
      <ResetPasswordForm email={email} />
    </section>
  );
}
