import Image from 'next/image';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';

export const AboutUsSection = () => {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <AnimatedWrapper type="slideInLeft">
            <h2 className="font-primary mb-6 text-4xl font-bold text-zinc-900">
              About HomeSphere
            </h2>

            <p className="font-secondary mb-6 leading-relaxed text-zinc-600">
              HomeSphere connects landlords and tenants seamlessly. We provide a
              secure, transparent, and efficient property management experience
              — from onboarding to lease completion.
            </p>

            <p className="font-secondary leading-relaxed text-zinc-600">
              Our mission is to simplify property transactions and make housing
              accessible, trustworthy, and stress-free.
            </p>

            <div className="mt-8 flex gap-8">
              <div>
                <h3 className="text-brand-dark text-3xl font-bold">500+</h3>
                <p className="text-sm text-zinc-500">Properties Listed</p>
              </div>

              <div>
                <h3 className="text-brand-dark text-3xl font-bold">2k+</h3>
                <p className="text-sm text-zinc-500">Happy Tenants</p>
              </div>

              <div>
                <h3 className="text-brand-dark text-3xl font-bold">1k+</h3>
                <p className="text-sm text-zinc-500">Satisfied Landlords</p>
              </div>
            </div>
          </AnimatedWrapper>

          <AnimatedWrapper type="slideInRight">
            <div className="relative h-100 overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/images/team_1.webp"
                alt="About HomeSphere"
                fill
                className="object-cover"
              />
            </div>
          </AnimatedWrapper>
        </div>
      </div>
    </section>
  );
};
