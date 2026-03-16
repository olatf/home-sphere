export function normalizeCountry(country: string): string {
  if (!country) return 'NG';

  const map: Record<string, string> = {
    nigeria: 'NG',
    ghana: 'GH',
    kenya: 'KE',
    'south africa': 'ZA',
    usa: 'US',
    'united states': 'US',
    uk: 'GB',
    'united kingdom': 'GB',
  };

  const key = country.trim().toLowerCase();

  return map[key] ?? country.toUpperCase();
}

export function normalizeIdType(country: string, idType: string): string {
  const types: Record<string, Record<string, string>> = {
    NG: {
      nin: 'NIN',
      passport: 'PASSPORT',
      drivers_license: 'DRIVERS_LICENSE',
    },

    GH: {
      passport: 'PASSPORT',
      ghana_card: 'NATIONAL_ID',
      drivers_license: 'DRIVERS_LICENSE',
    },

    KE: {
      passport: 'PASSPORT',
      drivers_license: 'DRIVERS_LICENSE',
    },

    ZA: {
      passport: 'PASSPORT',
      drivers_license: 'DRIVERS_LICENSE',
    },

    US: {
      passport: 'PASSPORT',
      drivers_license: 'DRIVERS_LICENSE',
    },

    GB: {
      passport: 'PASSPORT',
      drivers_license: 'DRIVERS_LICENSE',
    },
  };

  const key = idType.toLowerCase();

  return types[country]?.[key] ?? idType.toUpperCase();
}
