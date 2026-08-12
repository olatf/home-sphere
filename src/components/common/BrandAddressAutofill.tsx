'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { baseClass } from '@/config/constants';
import { Input } from '../ui/input';

export type SelectedAddress = {
  address: string;
  city: string;
  state: string;
  lga: string;
  lat: number;
  lng: number;
  placeId: string;
  formattedAddress: string;
};

interface MapboxSuggestion {
  mapbox_id: string;
  name: string;
  full_address: string;
  place_formatted: string;
  context?: {
    place?: { name: string };
  };
}

type BrandAddressAutofillProps = {
  value: string;
  onValueChange: (next: string) => void;
  onSelectAddress: (selection: SelectedAddress) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function BrandAddressAutofill({
  value,
  onValueChange,
  onSelectAddress,
  placeholder = 'Search address',
  disabled = false,
}: BrandAddressAutofillProps) {
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState(() => uuidv4());
  const containerRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // suggestions
  useEffect(() => {
    const searchTerm = value.trim();

    if (!apiKey || searchTerm.length < 3 || disabled) {
      // Resetting to the empty/closed state here is idempotent (no loop risk):
      // it only runs when the search term is too short to query, so it can't
      // cascade into another render that re-triggers this branch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const contrl = new AbortController();

    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          q: searchTerm,
          access_token: apiKey,
          session_token: sessionToken,
          language: 'en',
          country: 'NG',
          types: 'address,place,poi',
          limit: '6',
        });

        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?${query.toString()}`,
          { signal: contrl.signal }
        );

        if (!response.ok) throw new Error(`Suggest failed: ${response.status}`);

        const payload = await response.json();
        setSuggestions(payload.suggestions ?? []);
        setOpen((payload.suggestions ?? []).length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      contrl.abort();
      window.clearTimeout(timer);
    };
  }, [value, apiKey, sessionToken, disabled]);

  // Retrieve
  const handleSelect = async (suggestion: MapboxSuggestion) => {
    if (!apiKey) return;
    const params = new URLSearchParams({
      access_token: apiKey,
      session_token: sessionToken,
    });

    const res = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?${params.toString()}`
    );

    if (!res.ok) throw new Error(`Retrieve failed: ${res.status}`);

    const data = await res.json();

    if (!data.features || data.features.length === 0) {
      return;
    }

    const feature = data.features[0];

    console.log('feature', feature);

    const context = feature.properties.context;

    const city = context?.place?.name ?? '';
    const state = context?.region?.name ?? '';
    const lga = context?.district?.name || context?.locality?.name || '';

    const selected: SelectedAddress = {
      address: feature.properties.full_address || feature.properties.name,
      city: city,
      state: state,
      lga: lga,

      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
      placeId: feature.properties.mapbox_id,
      formattedAddress: feature.properties.full_address,
    };

    onSelectAddress(selected);
    onValueChange(selected.formattedAddress);
    setSuggestions([]);
    setOpen(false);

    // session reset
    setSessionToken(uuidv4());
  };

  const emptyMessage = useMemo(() => {
    if (!apiKey) return 'Missing Mapbox API key';
    if (value.trim().length < 3) return 'Type at least 3 characters';
    return 'No address suggestions found';
  }, [apiKey, value]);

  return (
    <div ref={containerRef} className="relative">
      <Input
        name="address"
        placeholder={placeholder}
        className={baseClass}
        type="text"
        value={value}
        disabled={disabled}
        onChange={event => {
          onValueChange(event.target.value);
          if (open && event.target.value === '') setOpen(false);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
      />

      {isLoading && (
        <div className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}

      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {suggestions.length > 0 ? (
            suggestions.map(item => (
              <button
                key={item.mapbox_id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full border-gray-100 border-b px-4 py-2 text-left outline-none transition-colors last:border-0 hover:bg-gray-50 focus:bg-gray-50"
              >
                <div className="font-medium text-gray-900 text-sm">
                  {item.name}
                </div>
                {item.place_formatted && (
                  <div className="text-gray-500 text-xs">
                    {item.place_formatted}
                  </div>
                )}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-gray-500 text-sm">{emptyMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
