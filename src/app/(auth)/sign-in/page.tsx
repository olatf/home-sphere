import { SignInForm, SideDisplay } from '@/components/auth';

export default function SignInPage() {
  return (
    <section className="mx-auto grid h-screen grid-cols-1 px-3 pt-9 md:max-w-6xl md:grid-cols-2 md:px-9 md:pt-10">
      <SideDisplay />
      <SignInForm />
    </section>
  );
}
