import {
  AboutHero,
  AboutSection,
  MissionSection,
  GoalsSection,
} from '@/sections/about';
import { TeamSection } from '@/sections/home';
export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <AboutHero />
      <AboutSection />
      <MissionSection />
      <GoalsSection />
      <TeamSection />
    </main>
  );
}
