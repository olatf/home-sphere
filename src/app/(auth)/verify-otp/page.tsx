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
    <section className="mx-auto grid h-screen grid-cols-1 px-3 pt-9 md:max-w-6xl md:grid-cols-2 md:px-9 md:pt-10">
      <SideDisplay />
      <VerifyOtpForm mode={mode} email={email} />
    </section>
  );
}
