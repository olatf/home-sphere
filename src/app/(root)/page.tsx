import { OverviewDashboard } from '@/dashboards';
import { PropertyHero } from '@/property';
import {
  NewsletterSection,
  TestimonialsSection,
  WhyChooseUsSection,
} from '@/sections/home';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PropertyHero />
      <OverviewDashboard />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
}
