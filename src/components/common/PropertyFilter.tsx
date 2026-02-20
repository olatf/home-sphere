'use client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePropertyFilterStore } from '@/stores/property-filter.store';
import { BrandButton } from './BrandButton';
import { Card } from '@/components/ui/card';

export const PropertyFilter = () => {
  const { filters, setFilter, resetFilters } = usePropertyFilterStore();

  const baseClass = `font-tertiary italic text-base font-normal text-brand-dark border-0 border-b-2 border-[#D0D5DD] rounded-none bg-transparent px-0 shadow-none focus:border-b focus:border-brand focus:ring-0 focus:outline-none focus-visible:border-b focus-visible:border-brand focus-visible:ring-0 focus-visible:outline-none`;

  const tabClass =
    ' text-zinc-900 hover:bg-slate-100 font-secondary text-zinc-900 font-secondary transition-all data-[state=active]:bg-black data-[state=active]:text-white';

  return (
    <Card className="w-full max-w-6xl rounded-2xl border-none bg-white p-6 shadow-xl">
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

      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
        <Input
          placeholder="Location"
          value={filters.location}
          onChange={e => setFilter('location', e.target.value)}
          className={baseClass}
        />

        <Input
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={e => setFilter('minPrice', e.target.value)}
          className={baseClass}
        />

        <Input
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={e => setFilter('maxPrice', e.target.value)}
          className={baseClass}
        />

        <Select
          value={filters.bedrooms}
          onValueChange={val => setFilter('bedrooms', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Bedrooms" className={baseClass} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1+ Bedroom</SelectItem>
            <SelectItem value="2">2+ Bedrooms</SelectItem>
            <SelectItem value="3">3+ Bedrooms</SelectItem>
            <SelectItem value="4">4+ Bedrooms</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy}
          onValueChange={val => setFilter('sortBy', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort By" className={baseClass} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="price-asc" className="text-green-900">
              Price ↑
            </SelectItem>
            <SelectItem value="price-desc" className="text-red-900">
              Price ↓
            </SelectItem>
          </SelectContent>
        </Select>

        <BrandButton
          onClick={resetFilters}
          brandVariant="primary"
          className="min-h-10 px-4 py-3"
        >
          Reset
        </BrandButton>
      </div>
    </Card>
  );
};
