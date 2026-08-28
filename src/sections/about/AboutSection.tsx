import Image from 'next/image';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';

export const AboutSection = () => {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto grid items-center gap-16 px-6 lg:grid-cols-2 lg:px-16">
        <AnimatedWrapper type="slideInUp">
          <div>
            <h2 className="mb-6 font-bold font-primary text-4xl text-gray-900">
              Who We Are
            </h2>
            <p className="mb-5 font-secondary text-gray-600 leading-relaxed">
              Homesphere is a modern real estate platform designed to simplify
              the renting and buying experience for landlords and tenants alike.
            </p>
            <p className="mb-5 font-secondary text-gray-600 leading-relaxed">
              We focus on transparency, secure documentation, smooth onboarding,
              and efficient communication between landlords and tenants — from
              first listing to final handshake.
            </p>
            <p className="font-secondary text-gray-600 leading-relaxed">
              Every feature we build starts with the same question: does this
              make renting or letting a home simpler and safer?
            </p>
          </div>
        </AnimatedWrapper>

        <AnimatedWrapper type="slideInRight">
          <div className="relative h-100 overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="/images/team_1.webp"
              alt="About Homesphere"
              fill
              className="object-cover"
            />
          </div>
        </AnimatedWrapper>
      </div>
    </section>
  );
};
