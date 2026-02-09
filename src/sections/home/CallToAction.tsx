import { BrandButton } from '@/components/common/BrandButton';
import Link from 'next/link';
export const CallToAction = () => {
  return (
    <section className="bg-indigo-600 py-12 text-center text-white">
      <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>
      <p className="mb-6">
        Join Mestate today and find the perfect property for you.
      </p>
      <BrandButton asChild className="mx-auto w-[20%]">
        <Link href="/signup">Get Started</Link>
      </BrandButton>
    </section>
  );
};
