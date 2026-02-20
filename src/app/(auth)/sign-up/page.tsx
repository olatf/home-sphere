import { SignUpForm, SideDisplay } from '@/components/auth';

export default function SignInPage() {
  return (
    <section className="mx-auto grid h-screen grid-cols-2 px-9 pt-10 md:max-w-6xl">
      <SignUpForm />
      <SideDisplay />
    </section>
  );
}
