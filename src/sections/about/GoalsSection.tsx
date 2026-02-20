import AnimatedWrapper from '@/components/common/AnimatedWrapper';
const goals = [
  'Enhance transparency in property transactions',
  'Simplify landlord onboarding',
  'Create a seamless tenant experience',
  'Leverage technology for secure documentation',
];

export const GoalsSection = () => {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-6 lg:px-16">
        <AnimatedWrapper type="slideInUp">
          <h2 className="mb-14 text-center text-4xl font-bold text-zinc-900">
            Our Goals
          </h2>
        </AnimatedWrapper>

        <div className="grid gap-8 md:grid-cols-2">
          {goals.map((goal, index) => (
            <AnimatedWrapper key={index} type="slideInUp">
              <div
                key={index}
                className="rounded-2xl bg-zinc-50 p-8 transition hover:shadow-lg"
              >
                <p className="text-lg text-zinc-700">{goal}</p>
              </div>
            </AnimatedWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};
