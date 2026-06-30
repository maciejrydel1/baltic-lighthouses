import {
  Lighthouse,
  LighthouseStatus,
  ConstructionCategory,
  COUNTRY_NAMES,
  getConstructionCategory,
} from '@/types/lighthouse';

export interface LighthouseFilters {
  countries: string[]; // kody ISO, pusta tablica = wszystkie
  statuses: LighthouseStatus[];
  constructionCategories: ConstructionCategory[];
}

// Stan początkowy filtrów — nic nie zaznaczone.
export const DEFAULT_FILTERS: LighthouseFilters = {
  countries: [],
  statuses: [],
  constructionCategories: [],
};

// Sprawdza, czy jakiekolwiek filtry są aktywne.
export function hasActiveFilters(filters: LighthouseFilters): boolean {
  return (
    filters.countries.length > 0 ||
    filters.statuses.length > 0 ||
    filters.constructionCategories.length > 0
  );
}

// Sprawdza, czy dana latarnia pasuje do zestawu filtrów.
function matchesFilters(
  lighthouse: Lighthouse,
  filters: LighthouseFilters
): boolean {
  if (
    filters.countries.length > 0 &&
    !filters.countries.includes(lighthouse.country)
  ) {
    return false;
  }

  if (
    filters.statuses.length > 0 &&
    !filters.statuses.includes(lighthouse.status)
  ) {
    return false;
  }

  if (filters.constructionCategories.length > 0) {
    const category = getConstructionCategory(lighthouse.construction);
    if (!filters.constructionCategories.includes(category)) {
      return false;
    }
  }

  return true;
}

// Filtruje listę latarni według podanych kryteriów.
export function filterLighthouses(
  lighthouses: Lighthouse[],
  filters: LighthouseFilters
): Lighthouse[] {
  if (!hasActiveFilters(filters)) return lighthouses;
  return lighthouses.filter((l) => matchesFilters(l, filters));
}

// Normalizuje tekst do wyszukiwania (małe litery, bez akcentów).
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Wyszukuje latarnie pasujące do zapytania tekstowego.
export function searchLighthouses(
  lighthouses: Lighthouse[],
  query: string
): Lighthouse[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return lighthouses;

  return lighthouses.filter((l) => {
    const countryName = COUNTRY_NAMES[l.country] || '';
    const text = [
      l.name,
      l.nameLocal,
      l.description,
      countryName,
      l.region,
      l.lightCharacter,
    ]
      .filter(Boolean)
      .join(' ');

    return normalizeQuery(text).includes(normalized);
  });
}

// Łączy filtrowanie i wyszukiwanie w jednej operacji.
export function applyFiltersAndSearch(
  lighthouses: Lighthouse[],
  filters: LighthouseFilters,
  query: string
): Lighthouse[] {
  const filtered = filterLighthouses(lighthouses, filters);
  return searchLighthouses(filtered, query);
}

// Toggle wartości w tablicy (dodaje, jeśli nie ma, usuwa jeśli jest).
export function toggleFilterValue<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value];
}
