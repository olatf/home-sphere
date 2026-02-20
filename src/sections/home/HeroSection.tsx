'use client';

import Image from 'next/image';
import { PropertyFilter } from '@/components/common/PropertyFilter';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';

export const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Image
        src="/images/house_2.webp"
        alt="Modern house exterior"
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl space-y-6">
          <AnimatedWrapper type="slideInUp">
            <h1 className="font-secondary text-4xl font-bold text-white md:text-6xl">
              Find Your Dream Home
            </h1>

            <p className="font-secondary mx-auto mt-2 max-w-2xl text-lg text-gray-200 md:text-xl">
              Discover premium properties tailored to your lifestyle. Buy or
              rent with confidence through HomeSphere.
            </p>
          </AnimatedWrapper>
          <AnimatedWrapper type="slideInDown">
            <div className="pt-6">
              <PropertyFilter />
            </div>
          </AnimatedWrapper>
        </div>
      </div>
    </section>
  );
};
