interface PropertiesType {
  id: number;
  title: string;
  location: string;
  price: string;
}

export const FeaturedProperties = () => {
  const properties: PropertiesType[] = [
    {
      id: 1,
      title: '2-Bedroom Apartment',
      location: 'Lagos',
      price: '$1200/mo',
    },
    { id: 2, title: 'Luxury Villa', location: 'Abuja', price: '$500k' },
    { id: 3, title: 'Studio Flat', location: 'Ibadan', price: '$400/mo' },
  ];

  return (
    <section className="px-6 py-12">
      <h2 className="mb-6 text-2xl font-semibold">Featured Properties</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {properties.map(property => (
          <div key={property.id} className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-bold">{property.title}</h3>
            <p className="text-zinc-900">{property.location}</p>
            <p className="text-brand font-semibold">{property.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
