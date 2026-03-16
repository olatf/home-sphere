/**
 * Convert a country name or code into a Smile-friendly ISO2 code.
 * - If the input already looks like an iso2 (2 letters), it is returned
 *   upper-cased.
 * - Otherwise we query reacrt-country-state-city  to look up a matching
 *   entry by name (case insensitive) or iso2.
 */
import { GetCountries } from 'react-country-state-city';

type Country = {
  name: string;
  iso2: string;
};

let countriesCache: Country[] | null = null;

/**
 * Convert a country name or code into a Smile-friendly ISO2 code.
 */
export async function normalizeCountry(input?: string): Promise<string> {
  if (!input) return '';

  const value = input.trim().toLowerCase();

  // Already ISO2
  if (value.length === 2) {
    return value.toUpperCase();
  }

  if (!countriesCache) {
    countriesCache = (await GetCountries()) as Country[];
  }

  const match = countriesCache.find(
    c => c.name?.toLowerCase() === value || c.iso2?.toLowerCase() === value
  );

  return match?.iso2?.toUpperCase() ?? input;
}

/**
 * Normalize ID type for SmileID API.
 * Smile expects specific ID type codes per country.
 * This maps common names to Smile-accepted values.
 */
export function normalizeIdType(countryCode: string, idType: string): string {
  const normalized = idType.toLowerCase().trim();

  // Nigeria mappings
  if (countryCode === 'NG') {
    switch (normalized) {
      case 'national_id':
      case 'nin':
        return 'NIN'; // National Identification Number
      case 'passport':
        return 'PASSPORT';
      case 'drivers_license':
      case 'dl':
        return 'DRIVERS_LICENSE';
      default:
        return idType.toUpperCase();
    }
  }

  // US mappings (for sandbox testing)
  if (countryCode === 'US') {
    switch (normalized) {
      case 'national_id':
      case 'nin':
      case 'drivers_license':
      case 'dl':
        return 'DRIVERS_LICENSE';
      case 'passport':
        return 'PASSPORT';
      case 'ssn':
        return 'SSN';
      default:
        return 'DRIVERS_LICENSE';
    }
  }

  // GB mappings (for sandbox testing)
  if (countryCode === 'GB') {
    switch (normalized) {
      case 'national_id':
      case 'nin':
      case 'drivers_license':
      case 'dl':
        return 'DRIVERS_LICENSE';
      case 'passport':
        return 'PASSPORT';
      default:
        return 'PASSPORT';
    }
  }

  // Add other countries as needed
  // For now, just uppercase the input
  return idType.toUpperCase();
}
