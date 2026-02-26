import AnimatedWrapper from '@/components/common/AnimatedWrapper';
export const PropertyHero = () => {
  return (
    <section className="flex h-[80vh] items-center bg-black py-20">
      <div className="container mx-auto px-6 text-center lg:px-16">
        <AnimatedWrapper type="slideInDown">
          <h1 className="mb-4 text-4xl font-bold text-white">
            Find Your Dream Home
          </h1>
        </AnimatedWrapper>
        <AnimatedWrapper type="slideInDown">
          <p className="mb-8 text-lg text-white">
            Explore our wide range of properties and find the perfect one for
            you.
          </p>
        </AnimatedWrapper>
      </div>
    </section>
  );
};
