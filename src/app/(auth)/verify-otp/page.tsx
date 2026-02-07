import { VerifyOtpForm, SideDisplay } from '@/components/auth';
import { redirect } from 'next/navigation';

interface VerifyOtpProps {
  searchParams: Promise<{ email: string; mode?: string }>;
}
export default async function VerifyOtpPage({ searchParams }: VerifyOtpProps) {
  const { email, mode } = await searchParams;

  if (!email) {
    redirect('/sign-up');
  }

  return (
    <section className="mx-auto my-3 grid h-screen max-w-6xl overflow-hidden bg-transparent px-3 md:my-10 md:px-7 lg:grid-cols-2">
      <SideDisplay />
      <VerifyOtpForm mode={mode} email={email} />
    </section>
  );
}
