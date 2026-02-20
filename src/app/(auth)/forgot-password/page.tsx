import { ForgotPasswordForm, SideDisplay } from '@/components/auth';

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto grid h-screen grid-cols-2 px-9 pt-10 md:max-w-6xl">
      <SideDisplay />
      <ForgotPasswordForm />
    </section>
  );
}
