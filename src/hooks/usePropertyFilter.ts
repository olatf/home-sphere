import { useMemo } from 'react';
import { usePropertyFilterStore } from '@/stores/property-filter.store';
import { Property } from '@/types/property';

export const usePropertyFilter = (properties: Property[], itemsPerPage = 6) => {
  const { filters, setPage } = usePropertyFilterStore();

  const filteredItems = useMemo(() => {
    return properties
      .filter(property => {
        const { mode, location, bedrooms, bathrooms, minPrice, maxPrice } =
          filters;

        if (mode !== 'all' && property.mode !== mode) return false;
        if (
          location &&
          !property.location.toLowerCase().includes(location.toLowerCase())
        )
          return false;
        if (bedrooms && property.bedrooms < Number(bedrooms)) return false;
        if (bathrooms && property.bathrooms < Number(bathrooms)) return false;
        if (minPrice && property.price < Number(minPrice)) return false;
        if (maxPrice && property.price > Number(maxPrice)) return false;

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          default:
            return 0;
        }
      });
  }, [properties, filters]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const start = (filters.page - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, filters.page, itemsPerPage]);

  const nextPage = () => {
    if (filters.page < totalPages) {
      setPage(filters.page + 1);
    }
  };

  const prevPage = () => {
    if (filters.page > 1) {
      setPage(filters.page - 1);
    }
  };

  const goToPage = (page: number) => {
    setPage(page);
  };

  return {
    filters,
    filteredItems,
    paginatedItems,
    totalPages,
    currentPage: filters.page,
    nextPage,
    prevPage,
    goToPage,
  };
};
