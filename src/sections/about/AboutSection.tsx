import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import Image from 'next/image';

export const AboutSection = () => {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto grid items-center gap-16 px-6 lg:grid-cols-2 lg:px-16">
        <AnimatedWrapper type="slideInUp">
          <div>
            <h2 className="mb-6 text-4xl font-bold text-zinc-900">
              Who We Are
            </h2>
            <AnimatedWrapper type="slideInUp">
              <p className="mb-6 leading-relaxed text-zinc-600">
                HomeSphere is a modern real estate platform designed to simplify
                the renting and buying experience.
              </p>
            </AnimatedWrapper>
            <AnimatedWrapper type="slideInUp">
              <p className="mt-5 leading-relaxed text-zinc-600">
                We focus on transparency, secure documentation, smooth
                onboarding, and efficient communication between landlords and
                tenants.
              </p>
            </AnimatedWrapper>
            <AnimatedWrapper type="slideInUp">
              <p className="mt-5 leading-relaxed text-zinc-600">
                We focus on transparency, secure documentation, smooth
                onboarding, and efficient communication between landlords and
                tenants.
              </p>
            </AnimatedWrapper>
            <AnimatedWrapper type="slideInUp">
              <p className="mt-5 leading-relaxed text-zinc-600">
                We focus on transparency, secure documentation, smooth
                onboarding, and efficient communication between landlords and
                tenants.
              </p>
            </AnimatedWrapper>
          </div>
        </AnimatedWrapper>

        <AnimatedWrapper type="slideInRight">
          <div className="relative h-100 overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="/images/team_1.webp"
              alt="About HomeSphere"
              fill
              className="object-cover"
            />
          </div>
        </AnimatedWrapper>
      </div>
    </section>
  );
};
