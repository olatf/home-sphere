export type PropertyMode = 'buy' | 'rent' | 'lease' | 'all';

export type PropertyType = 'apartment' | 'house' | 'duplex' | 'villa';

export type Property = {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  rating: number;
  location: string;
  mode: PropertyMode;
  image: string;
};
