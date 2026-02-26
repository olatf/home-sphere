import AnimatedWrapper from '@/components/common/AnimatedWrapper';
export const MissionSection = () => {
  return (
    <section className="bg-zinc-50 py-24">
      <div className="container mx-auto px-6 text-center lg:px-16">
        <AnimatedWrapper type="slideInUp">
          <h2 className="mb-8 text-4xl font-bold text-zinc-900">Our Mission</h2>
        </AnimatedWrapper>

        <AnimatedWrapper type="slideInUp">
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-zinc-600">
            To redefine real estate experiences by building a secure, efficient
            and trustworthy digital ecosystem for property transactions.
          </p>
        </AnimatedWrapper>
      </div>
    </section>
  );
};
