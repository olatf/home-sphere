import { PropertyGrid, PropertyHero } from '@/property';

export default function PropertiesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <PropertyHero />
      <PropertyGrid />
    </main>
  );
}
