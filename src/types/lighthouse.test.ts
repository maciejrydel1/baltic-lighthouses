import { describe, it, expect } from 'vitest';
import {
  featureToLighthouse,
  getConstructionCategory,
  LIGHT_COLORS,
  LIGHT_COLOR_NAMES,
  STATUS_NAMES,
  COUNTRY_NAMES,
} from '@/types/lighthouse';
import { mockFeature, mockLighthouses } from '@/test/fixtures';

describe('featureToLighthouse', () => {
  it('maps GeoJSON feature to Lighthouse', () => {
    const lighthouse = featureToLighthouse(mockFeature);
    expect(lighthouse.id).toBe('pl-swinoujscie');
    expect(lighthouse.name).toBe('Świnoujście');
    expect(lighthouse.coordinates).toEqual([14.2794, 53.9208]);
    expect(lighthouse.status).toBe('active');
  });
});

describe('getConstructionCategory', () => {
  it('detects brick construction', () => {
    expect(getConstructionCategory('round brick tower')).toBe('brick');
  });

  it('detects concrete construction', () => {
    expect(getConstructionCategory('round concrete tower')).toBe('concrete');
  });

  it('detects cast iron construction', () => {
    expect(getConstructionCategory('cast iron tower')).toBe('cast-iron');
  });

  it('detects stone construction', () => {
    expect(getConstructionCategory('stone tower')).toBe('stone');
  });

  it('returns other for unknown construction', () => {
    expect(getConstructionCategory('unknown')).toBe('other');
    expect(getConstructionCategory()).toBe('other');
  });
});

describe('LIGHT_COLORS', () => {
  it('includes all light colors used in fixtures', () => {
    const colors = new Set(mockLighthouses.map((l) => l.lightColor));
    colors.forEach((color) => {
      expect(LIGHT_COLORS[color]).toBeDefined();
      expect(LIGHT_COLOR_NAMES[color]).toBeDefined();
    });
  });
});

describe('STATUS_NAMES', () => {
  it('has Polish names for all statuses', () => {
    expect(STATUS_NAMES.active).toBe('Aktywna');
    expect(STATUS_NAMES.inactive).toBe('Nieaktywna');
    expect(STATUS_NAMES.historical).toBe('Historyczna');
  });
});

describe('COUNTRY_NAMES', () => {
  it('has Polish names for Baltic countries', () => {
    expect(COUNTRY_NAMES.PL).toBe('Polska');
    expect(COUNTRY_NAMES.FI).toBe('Finlandia');
    expect(COUNTRY_NAMES.EE).toBe('Estonia');
  });
});
