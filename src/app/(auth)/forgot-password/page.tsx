import { ForgotPasswordForm, SideDisplay } from '@/components/auth';

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto my-3 grid h-screen max-w-6xl overflow-hidden bg-transparent px-3 md:my-10 md:px-7 lg:grid-cols-2">
      <SideDisplay />
      <ForgotPasswordForm />
    </section>
  );
}
