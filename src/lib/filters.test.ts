import { describe, it, expect } from 'vitest';
import {
  applyFiltersAndSearch,
  filterLighthouses,
  searchLighthouses,
  toggleFilterValue,
  DEFAULT_FILTERS,
  hasActiveFilters,
} from '@/lib/filters';
import { mockLighthouses } from '@/test/fixtures';

describe('filterLighthouses', () => {
  it('returns all lighthouses when no filters are active', () => {
    expect(filterLighthouses(mockLighthouses, DEFAULT_FILTERS)).toHaveLength(
      mockLighthouses.length
    );
  });

  it('filters by country', () => {
    const result = filterLighthouses(mockLighthouses, {
      ...DEFAULT_FILTERS,
      countries: ['PL'],
    });
    expect(result).toHaveLength(3);
    expect(result.every((l) => l.country === 'PL')).toBe(true);
  });

  it('filters by status', () => {
    const result = filterLighthouses(mockLighthouses, {
      ...DEFAULT_FILTERS,
      statuses: ['inactive'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('pl-sopot');
  });

  it('filters by construction category', () => {
    const result = filterLighthouses(mockLighthouses, {
      ...DEFAULT_FILTERS,
      constructionCategories: ['cast-iron'],
    });
    expect(result).toHaveLength(2);
    expect(result.map((l) => l.id).sort()).toEqual([
      'ee-tahkuna',
      'pl-sopot',
    ]);
  });

  it('combines multiple filters', () => {
    const result = filterLighthouses(mockLighthouses, {
      countries: ['PL'],
      statuses: ['active'],
      constructionCategories: ['brick'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('pl-swinoujscie');
  });
});

describe('searchLighthouses', () => {
  it('returns all lighthouses for empty query', () => {
    expect(searchLighthouses(mockLighthouses, '')).toHaveLength(
      mockLighthouses.length
    );
  });

  it('finds by name', () => {
    const result = searchLighthouses(mockLighthouses, 'Hel');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('pl-hel');
  });

  it('finds by local name', () => {
    const result = searchLighthouses(
      mockLighthouses,
      'Latarnia Morska Świnoujście'
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('pl-swinoujscie');
  });

  it('finds by country name', () => {
    const result = searchLighthouses(mockLighthouses, 'Finlandia');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('fi-bengtskar');
  });

  it('is case-insensitive and ignores accents', () => {
    const result = searchLighthouses(mockLighthouses, 'swinoujscie');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('pl-swinoujscie');
  });
});

describe('applyFiltersAndSearch', () => {
  it('applies search after filters', () => {
    const result = applyFiltersAndSearch(
      mockLighthouses,
      { ...DEFAULT_FILTERS, countries: ['PL'] },
      'Hel'
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('pl-hel');
  });

  it('returns empty array when no matches', () => {
    const result = applyFiltersAndSearch(
      mockLighthouses,
      { ...DEFAULT_FILTERS, countries: ['FI'] },
      'Świnoujście'
    );
    expect(result).toHaveLength(0);
  });
});

describe('toggleFilterValue', () => {
  it('adds value when not present', () => {
    expect(toggleFilterValue([], 'PL')).toEqual(['PL']);
  });

  it('removes value when present', () => {
    expect(toggleFilterValue(['PL', 'FI'], 'PL')).toEqual(['FI']);
  });
});

describe('hasActiveFilters', () => {
  it('returns false for default filters', () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
  });

  it('returns true when any filter is active', () => {
    expect(
      hasActiveFilters({ ...DEFAULT_FILTERS, countries: ['PL'] })
    ).toBe(true);
  });
});
