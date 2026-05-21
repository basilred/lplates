import { describe, it, expect } from 'vitest';
import { MAP_CONFIG } from './mapUtils';

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
});
