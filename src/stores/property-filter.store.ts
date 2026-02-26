import { create } from 'zustand';
import { type PropertyMode, type PropertyTypes } from '@/types/property';

export type FilterState = {
  mode: PropertyMode;
  location: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  propertyTypes: PropertyTypes;
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
  propertyTypes: 'all',
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
