import { SideDisplay } from '@/components/auth';
import { OnboardingForm } from '@/components/onboarding';

export default async function OnboardingPage() {
  return (
    <section className="mx-auto my-3 grid h-screen max-w-6xl overflow-hidden bg-transparent px-3 md:my-10 md:px-7 lg:grid-cols-2">
      <SideDisplay />
      <OnboardingForm />
    </section>
  );
}
