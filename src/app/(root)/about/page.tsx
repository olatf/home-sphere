import { CtaSection } from '@/components/common/CtaSection';
import {
  AboutHero,
  AboutSection,
  GoalsSection,
  MissionSection,
} from '@/sections/about';
import { TeamSection } from '@/sections/home';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AboutHero />
      <AboutSection />
      <MissionSection />
      <GoalsSection />
      <TeamSection />
      <CtaSection
        title="Ready to find your next home?"
        description="Join thousands of tenants and landlords already using Homesphere to make renting simple."
      />
    </div>
  );
}
