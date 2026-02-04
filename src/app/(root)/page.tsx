import { HeroSection, FeaturedProperties, CallToAction } from '@/sections/home';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />
      <FeaturedProperties />
      <CallToAction />
    </main>
  );
}
