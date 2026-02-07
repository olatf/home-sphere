import { SignUpForm, SideDisplay } from '@/components/auth';

export default function SignInPage() {
  return (
    <section className="mx-auto my-3 grid h-screen w-full overflow-hidden bg-transparent px-3 md:my-10 md:max-w-6xl md:px-7 lg:grid-cols-2">
      <SignUpForm />
      <SideDisplay />
    </section>
  );
}
