import {
  HeroSection,
  PropertySummary,
  AboutUsSection,
  TeamSection,
  TestimonialsSection,
  NewsletterSection,
} from '@/sections/home';

export default function MarketingLanding() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />
      <PropertySummary />
      <AboutUsSection />
      <TeamSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  );
}
