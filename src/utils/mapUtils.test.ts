import { describe, it, expect } from 'vitest';
import { MAP_CONFIG } from './mapUtils';

describe('mapUtils', () => {
  it('should have valid configuration for each country', () => {
    const countries = ['ru', 'ua', 'by', 'cz'];
    countries.forEach(country => {
      const config = MAP_CONFIG[country]!;
      expect(config.url).toContain('https://');
      expect(config.center).toHaveLength(2);
      expect(config.scale).toBeGreaterThan(0);
    });
  });
});
