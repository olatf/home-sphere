import { Home, Search, ShieldCheck } from 'lucide-react';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { DecorativePageBackground } from '@/components/common/DecorativePageBackground';

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: 'Verified listings' },
  { icon: Home, label: 'Trusted landlords' },
  { icon: Search, label: 'Instant search' },
];

export const PropertyHero = () => {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden py-24 md:mt-10 xl:mt-0">
      <DecorativePageBackground />

      <div className="container relative z-10 mx-auto px-6 text-center lg:px-16">
        <AnimatedWrapper type="slideInDown">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 px-4 py-1.5 font-medium font-secondary text-brand-primary text-sm">
            Nigeria&apos;s most trusted rental marketplace
          </span>
        </AnimatedWrapper>

        <AnimatedWrapper type="slideInDown" delay={0.1}>
          <h1 className="mb-4 font-bold font-primary text-4xl text-brand-primary sm:text-5xl md:text-6xl lg:text-7xl">
            Find Your Dream Home
          </h1>
        </AnimatedWrapper>

        <AnimatedWrapper type="slideInDown" delay={0.2}>
          <p className="mx-auto mb-10 max-w-2xl text-gray-600 text-lg sm:text-xl md:text-2xl">
            Explore our wide range of properties and find the perfect one for
            you.
          </p>
        </AnimatedWrapper>

        <AnimatedWrapper type="fadeUp" delay={0.3}>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 font-secondary text-gray-500 text-sm"
              >
                <Icon className="h-4 w-4 text-brand-primary" />
                {label}
              </div>
            ))}
          </div>
        </AnimatedWrapper>
      </div>
    </section>
  );
};
