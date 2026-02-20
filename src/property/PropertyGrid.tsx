'use client';

import { mockProperties } from '@/data/MockProperty';
import { PropertyFilter } from '@/components/common/PropertyFilter';
import { PropertyCard } from '@/sections/home';
import { Pagination } from '@/components/common/Pagination';
import { usePropertyFilter } from '@/hooks/usePropertyFilter';

export const PropertyGrid = () => {
  const { paginatedItems, totalPages, currentPage, goToPage } =
    usePropertyFilter(mockProperties);

  return (
    <section className="bg-zinc-50 py-10">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="my-9">
          <PropertyFilter />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {paginatedItems.length > 0 ? (
            paginatedItems.map(p => <PropertyCard key={p.id} {...p} />)
          ) : (
            <div className="col-span-full my-9 text-center text-zinc-600">
              No properties found matching your criteria.
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex justify-center gap-4">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      </div>
    </section>
  );
};
