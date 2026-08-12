import { FileCheck2, KeyRound, ShieldCheck, Sparkles } from 'lucide-react';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';

const goals = [
  {
    icon: ShieldCheck,
    title: 'Transparency',
    description: 'Enhance transparency in every property transaction.',
  },
  {
    icon: KeyRound,
    title: 'Simplicity',
    description: 'Simplify landlord onboarding from day one.',
  },
  {
    icon: Sparkles,
    title: 'Experience',
    description: 'Create a seamless, low-friction tenant experience.',
  },
  {
    icon: FileCheck2,
    title: 'Security',
    description: 'Leverage technology for secure documentation.',
  },
];

export const GoalsSection = () => {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-6 lg:px-16">
        <AnimatedWrapper type="slideInUp">
          <h2 className="mb-14 text-center font-bold font-primary text-4xl text-gray-900">
            Our Goals
          </h2>
        </AnimatedWrapper>

        <div className="grid gap-6 md:grid-cols-2">
          {goals.map(({ icon: Icon, title, description }, index) => (
            <AnimatedWrapper key={title} type="slideInUp" delay={index * 0.1}>
              <div className="flex items-start gap-4 rounded-2xl bg-gray-50 p-8 transition hover:shadow-md">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
                  <Icon className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <h3 className="mb-1 font-primary font-semibold text-gray-900">
                    {title}
                  </h3>
                  <p className="font-secondary text-gray-600">{description}</p>
                </div>
              </div>
            </AnimatedWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};
