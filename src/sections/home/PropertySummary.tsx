'use client';

import Image from 'next/image';
import { MapPin, BedDouble, Bath } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { mockProperties } from '@/data/MockProperty';
import { BrandStarRating } from '@/components/common/BrandStarRating';
import { BrandButton } from '@/components/common/BrandButton';
import AnimatedWrapper from '@/components/common/AnimatedWrapper';
import { usePropertyFilter } from '@/hooks/usePropertyFilter';
import { type PropertyTypes } from '@/types/property';
import { capitalizeWords } from '@/helpers/formatters.helpers';

export const PropertySummary = () => {
  const { paginatedItems } = usePropertyFilter(mockProperties);

  return (
    <section className="bg-muted/30 py-20">
      <AnimatedWrapper type="slideInDown">
        <h2 className="font-primary mb-2 px-6 text-4xl font-semibold">
          Our Listing Summary
        </h2>
      </AnimatedWrapper>
      <AnimatedWrapper type="slideInUp">
        <p className="font-secondary text-md mb-5 px-6 font-normal">
          Take a look at our best selling apartment and top viewed houses
        </p>
      </AnimatedWrapper>
      <AnimatedWrapper type="slideInDown">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.length > 0 ? (
              paginatedItems.map(property => (
                <PropertyCard key={property.id} {...property} />
              ))
            ) : (
              <div className="col-span-full my-9 text-center text-zinc-600">
                No properties found matching your criteria.
              </div>
            )}
          </div>
        </div>
        <div className="mx-auto mt-9 flex max-w-md items-center justify-center">
          <BrandButton asChild>
            <Link href="/properties">Explore More</Link>
          </BrandButton>
        </div>
      </AnimatedWrapper>
    </section>
  );
};

type PropertyCardProps = {
  id: string;
  title: string;
  location: string;
  price: number;
  propertyType: PropertyTypes;
  bedrooms: number;
  rating: number;
  bathrooms: number;
  image: string;
};

export const PropertyCard = ({
  id,
  title,
  location,
  price,
  bedrooms,
  propertyType,
  bathrooms,
  rating,
  image,
}: PropertyCardProps) => {
  return (
    <Link key={id} href={`/properties/${id}`} className="group">
      <Card className="group overflow-hidden rounded-lg border border-zinc-200 bg-white transition-all duration-300 hover:shadow-lg">
        <div className="relative h-60 w-full overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <CardContent className="space-y-3 px-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
              {title}
            </h3>
            <BrandStarRating value={rating} size={16} />
          </div>

          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <MapPin size={16} className="text-green-600" />
            {location}
          </div>

          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <MapPin size={16} className="text-green-600" />
            Property Type: {capitalizeWords(propertyType)}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-sm text-zinc-700">
              <span className="flex items-center gap-1">
                <BedDouble size={16} className="text-green-600" />
                {bedrooms} Bed
              </span>
              <span className="flex items-center gap-1">
                <Bath size={16} className="text-green-600" />
                {bathrooms} Bath
              </span>
            </div>

            <span className="text-lg font-bold text-green-600">
              ${price.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
