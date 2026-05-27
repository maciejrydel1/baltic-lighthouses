// Status latarni
export type LighthouseStatus = 'active' | 'inactive' | 'historical';

// Interfejs pojedynczej latarni morskiej
export interface Lighthouse {
  id: string;
  name: string;
  nameLocal?: string;
  country: string;
  region?: string;
  coordinates: [number, number]; // [lng, lat]
  yearBuilt: number;
  heightM: number;
  focalHeightM?: number;
  rangeNm: number;
  lightCharacter?: string;
  lightColor: 'white' | 'red' | 'green' | 'yellow';
  construction?: string;
  status: LighthouseStatus;
  visitable: boolean;
  arlhsCode?: string;
  admiraltyCode?: string;
  description?: string;
  imageUrl?: string | null;
  wikipediaUrl?: string;
  visitorsPerYear?: number;
}

// Typ GeoJSON Feature z propertiesami latarni
export interface LighthouseFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: Omit<Lighthouse, 'coordinates'>;
}

// Typ GeoJSON FeatureCollection
export interface LighthouseCollection {
  type: 'FeatureCollection';
  metadata?: {
    title: string;
    description: string;
    version: string;
    lastUpdated: string;
    sources: string[];
  };
  features: LighthouseFeature[];
}

// Kolory świateł latarni → kolory markerów na globie
export const LIGHT_COLORS: Record<string, string> = {
  white: '#fffbe6',   // ciepły biały/złoty
  red: '#ef4444',
  green: '#22c55e',
  yellow: '#eab308',
};

// Kolory flag krajów bałtyckich
export const COUNTRY_COLORS: Record<string, string> = {
  PL: '#dc2626', // czerwony
  SE: '#2563eb', // niebieski
  DE: '#000000', // czarny
  DK: '#dc2626', // czerwony
  FI: '#2563eb', // niebieski
  EE: '#1e40af', // ciemnoniebieski
  LV: '#991b1b', // bordowy
  LT: '#ca8a04', // złoty
  RU: '#2563eb', // niebieski
};

// Nazwy krajów
export const COUNTRY_NAMES: Record<string, string> = {
  PL: 'Polska',
  SE: 'Szwecja',
  DE: 'Niemcy',
  DK: 'Dania',
  FI: 'Finlandia',
  EE: 'Estonia',
  LV: 'Łotwa',
  LT: 'Litwa',
  RU: 'Rosja',
};

// Helper: konwersja GeoJSON Feature na Lighthouse
export function featureToLighthouse(feature: LighthouseFeature): Lighthouse {
  return {
    ...feature.properties,
    coordinates: feature.geometry.coordinates,
  };
}
