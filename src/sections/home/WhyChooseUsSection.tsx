import Image from 'next/image';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';

const STATS = [
  { value: '500+', label: 'Properties Listed' },
  { value: '2k+', label: 'Happy Tenants' },
  { value: '1k+', label: 'Satisfied Landlords' },
];

export const WhyChooseUsSection = () => {
  return (
    <section className="bg-white py-18">
      <div className="container mx-auto grid items-center gap-16 px-3 lg:grid-cols-2">
        <AnimatedWrapper type="slideInLeft">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 px-4 py-1.5 font-medium font-secondary text-brand-primary text-sm">
              Why Homesphere
            </span>
            <h2 className="mb-6 font-bold font-primary text-4xl text-gray-900">
              Renting, reimagined
            </h2>
            <p className="mb-4 font-secondary text-gray-600 leading-relaxed">
              Homesphere connects landlords and tenants seamlessly. We provide a
              secure, transparent, and efficient property management experience
              — from onboarding to lease completion.
            </p>
            <p className="mb-8 font-secondary text-gray-600 leading-relaxed">
              Our mission is to simplify property transactions and make housing
              accessible, trustworthy, and stress-free.
            </p>

            <div className="flex gap-8">
              {STATS.map(stat => (
                <div key={stat.label}>
                  <h3 className="font-bold font-primary text-3xl text-brand-primary">
                    {stat.value}
                  </h3>
                  <p className="font-secondary text-gray-500 text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedWrapper>

        <AnimatedWrapper type="slideInRight">
          <div className="relative h-100 overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="/images/house_3.webp"
              alt="A Homesphere-listed property"
              fill
              className="object-cover"
            />
          </div>
        </AnimatedWrapper>
      </div>
    </section>
  );
};
