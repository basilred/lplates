import { describe, it, expect } from 'vitest';
import { MAP_CONFIG, REGION_MAPPING } from './mapUtils';

describe('mapUtils', () => {
  it('should have valid configuration for each country', () => {
    const countries = ['ru', 'ua', 'by', 'cz'];
    countries.forEach(country => {
      expect(MAP_CONFIG[country]).toBeDefined();
      expect(MAP_CONFIG[country].url).toContain('https://');
      expect(MAP_CONFIG[country].center).toHaveLength(2);
      expect(MAP_CONFIG[country].scale).toBeGreaterThan(0);
    });
  });

  it('should have region mapping for each country', () => {
    const countries = ['ru', 'ua', 'by', 'cz'];
    countries.forEach(country => {
      expect(REGION_MAPPING[country]).toBeDefined();
      expect(Object.keys(REGION_MAPPING[country]).length).toBeGreaterThan(0);
    });
  });

  it('should map specific regions correctly', () => {
    // RU
    expect(REGION_MAPPING.ru['Москва']).toBe('Moskva');
    expect(REGION_MAPPING.ru['Адыгея']).toBe('Adygey');
    
    // UA
    expect(REGION_MAPPING.ua['Киев']).toBe('Kyiv');
    expect(REGION_MAPPING.ua['АР Крым']).toBe('Crimea');
    
    // CZ
    expect(REGION_MAPPING.cz['Praha']).toBe('Prague');
  });
});
