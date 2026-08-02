import AnimatedWrapper from '@/components/common/AnimatedWrapper';

export const MissionSection = () => {
  return (
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto px-6 text-center lg:px-16">
        <AnimatedWrapper type="slideInUp">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-white px-4 py-1.5 font-medium font-secondary text-brand-primary text-sm">
            Our mission
          </span>
        </AnimatedWrapper>

        <AnimatedWrapper type="slideInUp" delay={0.1}>
          <h2 className="mb-6 font-bold font-primary text-4xl text-gray-900">
            Redefining real estate, together
          </h2>
        </AnimatedWrapper>

        <AnimatedWrapper type="slideInUp" delay={0.2}>
          <p className="mx-auto max-w-3xl font-secondary text-gray-600 text-lg leading-relaxed">
            To redefine real estate experiences by building a secure, efficient,
            and trustworthy digital ecosystem for property transactions.
          </p>
        </AnimatedWrapper>
      </div>
    </section>
  );
};
