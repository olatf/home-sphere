import type { CreatePropertyFormData } from '@/lib/schemas/property';
import { createPropertySchema } from '@/lib/schemas/property';

export type { CreatePropertyFormData };
export { createPropertySchema };

export const STEPS = [
  'basic',
  'location',
  'features',
  'pricing',
  'media',
  'review',
] as const;

export type Step = (typeof STEPS)[number];

export const STEP_LABELS: Record<Step, string> = {
  basic: 'Basic Info',
  location: 'Location',
  features: 'Features',
  pricing: 'Pricing',
  media: 'Media & Docs',
  review: 'Review',
};

export const AMENITIES = [
  'swimming_pool',
  'gym',
  'generator',
  '24hr_security',
  'cctv',
  'elevator',
  'parking',
  'internet',
  'air_conditioning',
  'solar_power',
  'water_treatment',
  'playground',
  'garden',
  'borehole',
];

export const UTILITIES = ['water', 'electricity', 'gas', 'waste_disposal'];

export const PROPERTY_TYPES = [
  'apartment',
  'house',
  'commercial',
  'land',
  'shortlet',
] as const;

export const LISTING_TYPES = ['rent', 'lease', 'sale'] as const;

export const FURNISHING_TYPES = [
  { value: 'furnished', label: 'Fully Furnished' },
  { value: 'semi_furnished', label: 'Semi Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
];

export const EMPTY_DEFAULTS: CreatePropertyFormData = {
  title: '',
  description: '',
  listing_type: 'rent',
  property_type: 'apartment',
  duration_years: 1,
  available_units: 1,
  // legal_services_available: false,
  tags: [],
  gallery: [],
  feature_image: '',
  proof_of_ownership: '',
  video_tour_url: '',
  features: {
    bedrooms: 1,
    bathrooms: 1,
    toilets: 1,
    parking_spaces: 0,
    floor_area_sqm: 0,
    furnishing: 'unfurnished',
    amenities: [],
    utilities_included: [],
    floors: undefined,
    year_built: undefined,
  },
  pricing: {
    price: 0,
    allows_instalment: false,
    caution_fee: undefined,
    instalment_plan: undefined,
  },
  location: {
    country: 'Nigeria',
    address: '',
    city: '',
    state: '',
    lga: '',
    latitude: undefined,
    longitude: undefined,
    landmark: undefined,
  },
};

export async function apiCreateProperty(
  data: CreatePropertyFormData,
  publish: boolean
) {
  const res = await fetch('/api/properties', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, publish }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to create property');
  return json as { success: true; data: { id: string } };
}

export async function apiUpdateProperty(
  id: string,
  data: Partial<CreatePropertyFormData>
) {
  const res = await fetch(`/api/properties/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to update property');
  return json as { success: true; data: { id: string } };
}

export async function apiPublishProperty(id: string, status?: string) {
  const baseUrl = `/api/properties/${id}/publish`;
  const url = status ? `${baseUrl}?status=${status}` : baseUrl;

  const res = await fetch(url, { method: 'POST' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to publish property');
  return json as { success: true };
}
