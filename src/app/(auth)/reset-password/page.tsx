import { redirect } from 'next/navigation';
import { ResetPasswordForm, SideDisplay } from '@/components/auth';

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
    <section className="flex min-h-screen w-full items-center justify-center px-3 md:px-5 lg:px-9">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
        <SideDisplay />
        <ResetPasswordForm email={email} />
      </div>
    </section>
  );
}
