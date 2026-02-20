import { create } from 'zustand';
import { type PropertyMode } from '@/types/property';

export type FilterState = {
  mode: PropertyMode;
  location: string;
  type: string;
  bedrooms: string;
  minPrice: string;
  maxPrice: string;
  bathrooms: string;
  sortBy: 'latest' | 'price-asc' | 'price-desc';
  page: number;
};

type PropertyFilterStore = {
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: string | number) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
};

const initialState: FilterState = {
  mode: 'all',
  location: '',
  type: '',
  bedrooms: '',
  bathrooms: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'latest',
  page: 1,
};

export const usePropertyFilterStore = create<PropertyFilterStore>(set => ({
  filters: initialState,

  setFilter: (key, value) =>
    set(state => ({
      filters: {
        ...state.filters,
        [key]: value,
        page: 1,
      },
    })),

  resetFilters: () => set({ filters: initialState }),

  setPage: page =>
    set(state => ({
      filters: { ...state.filters, page },
    })),
}));
