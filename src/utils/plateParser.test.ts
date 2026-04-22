import { describe, it, expect } from 'vitest';
import { parsePlate } from './plateParser';

describe('parsePlate', () => {
  describe('RU (Russia) plates', () => {
    it('should extract region from standard plates', () => {
      expect(parsePlate('A123BC77').ru).toEqual(['77']);
      expect(parsePlate('Е123ОУ01').ru).toEqual(['01']); // Cyrillic
      expect(parsePlate('X001XX177').ru).toEqual(['177']);
    });

    it('should extract region from trailer plates', () => {
      expect(parsePlate('AB123477').ru).toEqual(['77']);
    });

    it('should extract region from motorcycle/military plates', () => {
      expect(parsePlate('1234AB77').ru).toEqual(['77']);
      expect(parsePlate('5678MT99').ru).toEqual(['99']);
    });

    it('should extract region from public transport plates', () => {
      expect(parsePlate('AB12377').ru).toEqual(['77']);
    });

    it('should extract region from police plates', () => {
      expect(parsePlate('A123477').ru).toEqual(['77']);
    });

    it('should extract region from transit plates', () => {
      expect(parsePlate('AB123A77').ru).toEqual(['77']);
    });

    it('should handle spaces and hyphens', () => {
      expect(parsePlate('A 123 BC 77').ru).toEqual(['77']);
      expect(parsePlate('A-123-BC-77').ru).toEqual(['77']);
    });
  });

  describe('UA (Ukraine) plates', () => {
    it('should extract region from standard plates', () => {
      expect(parsePlate('AA1234BA').ua).toEqual(['AA']);
      expect(parsePlate('КА1234ВК').ua).toEqual(['KA']); // Cyrillic
      expect(parsePlate('AI5678CI').ua).toEqual(['AI']);
    });

    it('should handle Ukrainian I (І)', () => {
      expect(parsePlate('АІ1234ВВ').ua).toEqual(['AI']);
    });
  });

  describe('CZ (Czech Republic) plates', () => {
    it('should extract region from standard plates', () => {
      expect(parsePlate('1A2 3456').cz).toEqual(['A']);
      expect(parsePlate('2B31234').cz).toEqual(['B']);
      expect(parsePlate('5E78901').cz).toEqual(['E']);
    });
  });
  
  describe('BY (Belarus) plates', () => {
    it('should extract region from standard car plates', () => {
      expect(parsePlate('1234 AB-7').by).toEqual(['7']);
      expect(parsePlate('5678 KH 1').by).toEqual(['1']);
    });

    it('should extract region from truck/bus plates', () => {
      expect(parsePlate('AB 1234-7').by).toEqual(['7']);
      expect(parsePlate('KH 5678 1').by).toEqual(['1']);
    });

    it('should handle Cyrillic characters', () => {
      expect(parsePlate('1234 АВ-7').by).toEqual(['7']);
    });
  });

  describe('False Positives', () => {
    it('should not extract RU region from random digits', () => {
      expect(parsePlate('1234567').ru).toBeUndefined();
      expect(parsePlate('12345678').ru).toBeUndefined();
    });

    it('should not extract UA region from random strings', () => {
      expect(parsePlate('ABC1234DE').ua).toBeUndefined();
      expect(parsePlate('A1234BC').ua).toBeUndefined();
    });

    it('should not extract CZ region from random strings', () => {
      expect(parsePlate('ABCDEFG').cz).toBeUndefined();
      expect(parsePlate('1234567').cz).toBeUndefined();
    });

    it('should not extract BY region from random strings', () => {
      expect(parsePlate('1234567').by).toBeUndefined();
      expect(parsePlate('ABCDEFG').by).toBeUndefined();
    });
  });

  describe('Standardization', () => {
    it('should include both normalized and standardized in any', () => {
      const result = parsePlate('А123ВС77'); // Cyrillic
      expect(result.any).toContain('А123ВС77');
      expect(result.any).toContain('A123BC77');
    });
  });
});
