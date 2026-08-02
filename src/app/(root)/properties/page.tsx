import { OverviewDashboard } from '@/dashboards';
import { PropertyHero } from '@/property';

export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PropertyHero />
      <div className="p-3 md:p-4">
        <OverviewDashboard />
      </div>
    </div>
  );
}
