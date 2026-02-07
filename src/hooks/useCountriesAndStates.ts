'use client';

import { useQuery } from '@tanstack/react-query';
import consola from 'consola';
import { GetCountries, GetState } from 'react-country-state-city';
import { toast } from 'sonner';
import { getErrorMessage } from '@/helpers/error.helpers';

export function useCountriesAndStates(countryName?: string) {
  const countriesQuery = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const data = await GetCountries();
      return data ?? [];
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const statesQuery = useQuery({
    queryKey: ['states', countryName],
    queryFn: async () => {
      if (!countryName) return [];
      // `GetState` expects a numeric country id. We store countries from
      // `GetCountries` in `countriesQuery.data` — find the matching country
      // by ISO (e.g. 'NG') and pass its `id` to `GetState`.
      const countries = countriesQuery.data as
        | Array<{ id: number; iso2?: string; isoCode?: string; name: string }>
        | undefined;
      const country = countries?.find(c => c.name === countryName);
      if (!country) return [];
      const data = await GetState(country.id);
      return data ?? [];
    },
    enabled: !!countryName,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  if (countriesQuery.error || statesQuery.error) {
    const errorMessage = getErrorMessage(
      countriesQuery.error ?? statesQuery.error
    );
    toast.error(errorMessage);
    consola.error(errorMessage);
  }

  return {
    countries: countriesQuery.data ?? [],
    states: statesQuery.data ?? [],
    isCountriesLoading: countriesQuery.isLoading,
    isStatesLoading: statesQuery.isLoading,
  };
}
