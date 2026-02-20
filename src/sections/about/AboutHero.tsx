import AnimatedWrapper from '@/components/common/AnimatedWrapper';

export const AboutHero = () => {
  return (
    <section className="relative flex h-[90vh] items-center justify-center overflow-hidden bg-zinc-900 text-white">
      <div className="absolute inset-0 bg-black/50" />
      <AnimatedWrapper type="slideInUp">
        <div className="relative px-6 text-center">
          <h1 className="mb-6 text-5xl font-bold md:text-6xl">
            About HomeSphere
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-200">
            Connecting landlords and tenants through trust, innovation, and
            seamless property management.
          </p>
        </div>
      </AnimatedWrapper>
    </section>
  );
};
