'use client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Slider } from '@/components/ui/slider';
import { usePropertyFilterStore } from '@/stores/property-filter.store';
import { BrandButton } from './BrandButton';
import { Card } from '@/components/ui/card';
import { type PropertyTypes } from '@/types/property';

type propertyType = {
  value: PropertyTypes;
  title: string;
};

const PropertyType: propertyType[] = [
  {
    value: 'selfcon',
    title: 'Self Con',
  },
  {
    value: 'apartment',
    title: 'Apartment',
  },
  {
    value: 'condo',
    title: 'Condo',
  },
  {
    value: 'duplex',
    title: 'Duplex',
  },
  {
    value: 'semi-detached',
    title: 'Semi-Detached',
  },
  {
    value: 'villa',
    title: 'Villa',
  },
];

export const PropertyFilter = () => {
  const { filters, setFilter, resetFilters } = usePropertyFilterStore();

  const priceRange = [
    Number(filters.minPrice) || 0,
    Number(filters.maxPrice) || 10000000,
  ];

  const handlePriceChange = (value: number[]) => {
    setFilter('minPrice', String(value[0]));
    setFilter('maxPrice', String(value[1]));
  };

  const baseClass = `font-tertiary italic text-base font-normal text-brand-dark border-0 border-b-2 border-[#D0D5DD] rounded-none bg-transparent px-0 shadow-none focus:border-b focus:border-brand focus:ring-0 focus:outline-none focus-visible:border-b focus-visible:border-brand focus-visible:ring-0 focus-visible:outline-none`;

  const tabClass =
    ' text-zinc-900 hover:bg-slate-100 font-secondary text-zinc-900 font-secondary transition-all data-[state=active]:bg-black data-[state=active]:text-white';

  return (
    <Card className="mx-auto w-full max-w-4xl rounded-2xl border-none bg-white p-6 shadow-xl">
      <Tabs
        value={filters.mode}
        onValueChange={value => setFilter('mode', value)}
        className="mb-6"
      >
        <TabsList className="grid w-90 grid-cols-4 border bg-transparent">
          <TabsTrigger value="all" className={tabClass}>
            All
          </TabsTrigger>
          <TabsTrigger value="buy" className={tabClass}>
            Buy
          </TabsTrigger>
          <TabsTrigger value="rent" className={tabClass}>
            Rent
          </TabsTrigger>
          <TabsTrigger value="lease" className={tabClass}>
            Lease
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
        <div className="flex w-full items-center gap-2 md:flex-1">
          <div className="w-full lg:w-[50%]">
            <Input
              placeholder="Location"
              value={filters.location}
              onChange={e => setFilter('location', e.target.value)}
              className={cn(baseClass)}
            />
          </div>

          <div className="w-full space-y-3 md:w-[50%]">
            <div className="font-primary flex justify-between text-xs font-medium">
              <span>₦{Number(priceRange[0]).toLocaleString()}</span>
              <span>₦{Number(priceRange[1]).toLocaleString()}</span>
            </div>

            <Slider
              value={priceRange}
              min={0}
              max={1000000}
              step={5000}
              className="text-brand data-[orientation=vertical]:bg-brand"
              onValueChange={handlePriceChange}
            />
          </div>
        </div>

        <div className="mt-5 flex w-full items-center gap-2 md:mt-0 md:w-auto">
          <Select
            value={filters.propertyTypes}
            onValueChange={val => setFilter('propertyTypes', val)}
          >
            <SelectTrigger className="w-[50%] md:flex-1">
              <SelectValue placeholder="Property Type" className={baseClass} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all"> Property Types</SelectItem>
              {PropertyType.map(property => {
                return (
                  <SelectItem key={property.value} value={property.value}>
                    {property.title}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <BrandButton
            onClick={resetFilters}
            brandVariant="primary"
            className="min-h-10 w-[30%] px-4 py-3"
          >
            Reset
          </BrandButton>
        </div>
      </div>
    </Card>
  );
};
