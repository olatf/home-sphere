import { SideDisplay } from '@/components/auth';
import { OnboardingForm } from '@/components/onboarding';

export default async function OnboardingPage() {
  return (
    <section className="mx-auto grid h-screen grid-cols-2 px-9 pt-10 md:max-w-6xl">
      <SideDisplay />
      <OnboardingForm />
    </section>
  );
}
