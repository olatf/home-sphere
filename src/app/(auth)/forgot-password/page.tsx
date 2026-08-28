import { ForgotPasswordForm, SideDisplay } from '@/components/auth';

export default function ForgotPasswordPage() {
  return (
    <section className="flex min-h-screen w-full items-center justify-center px-3 md:px-5 lg:px-9">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
        <SideDisplay />
        <ForgotPasswordForm />
      </div>
    </section>
  );
}
