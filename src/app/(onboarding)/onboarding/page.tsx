import { SideDisplay } from '@/components/auth';
import { OnboardingForm } from '@/components/onboarding';

export default async function OnboardingPage() {
  return (
    <section className="flex h-screen w-full items-center justify-center px-3 md:px-5 lg:px-9">
      <div className="mx-auto grid h-[90vh] w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
        <SideDisplay />
        <OnboardingForm />
      </div>
    </section>
  );
}
