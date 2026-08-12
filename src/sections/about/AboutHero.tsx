import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { DecorativePageBackground } from '@/components/common/DecorativePageBackground';

export const AboutHero = () => {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden py-24">
      <DecorativePageBackground />

      <div className="container relative z-10 mx-auto px-6 text-center lg:px-16">
        <AnimatedWrapper type="slideInDown">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 px-4 py-1.5 font-medium font-secondary text-brand-primary text-sm">
            Our story
          </span>
        </AnimatedWrapper>

        <AnimatedWrapper type="slideInUp" delay={0.1}>
          <h1 className="mb-6 font-bold font-primary text-4xl text-brand-primary sm:text-5xl md:text-6xl">
            About Homesphere
          </h1>
        </AnimatedWrapper>

        <AnimatedWrapper type="slideInUp" delay={0.2}>
          <p className="mx-auto max-w-2xl text-gray-600 text-lg md:text-xl">
            Connecting landlords and tenants through trust, innovation, and
            seamless property management.
          </p>
        </AnimatedWrapper>
      </div>
    </section>
  );
};
