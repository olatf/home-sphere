import { redirect } from 'next/navigation';
import { SideDisplay, VerifyOtpForm } from '@/components/auth';

interface VerifyOtpProps {
  searchParams: Promise<{ email: string; mode?: string }>;
}
export default async function VerifyOtpPage({ searchParams }: VerifyOtpProps) {
  const { email, mode } = await searchParams;

  if (!email) {
    redirect('/sign-up');
  }

  return (
    <section className="flex min-h-screen w-full items-center justify-center px-3 md:px-5 lg:px-9">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
        <SideDisplay />
        <VerifyOtpForm mode={mode} email={email} />
      </div>
    </section>
  );
}
