export type PropertyMode = 'buy' | 'rent' | 'lease' | 'all';

export type PropertyTypes =
  | 'apartment'
  | 'selfcon'
  | 'duplex'
  | 'villa'
  | 'semi-detached'
  | 'condo'
  | 'all';

export type Property = {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  rating: number;
  location: string;
  propertyType: PropertyTypes;
  mode: PropertyMode;
  image: string;
};
