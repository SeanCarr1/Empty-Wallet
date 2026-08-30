import {
  formatCurrency,
  formatCompactCurrency,
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY,
} from '../currency';

describe('Currency Service', () => {
  describe('SUPPORTED_CURRENCIES and DEFAULT_CURRENCY', () => {
    it('should have PHP as the default currency', () => {
      expect(DEFAULT_CURRENCY).toBe('PHP');
    });

    it('should define configs for all expected currencies with symbols and decimal places', () => {
      expect(SUPPORTED_CURRENCIES.PHP).toEqual({
        code: 'PHP',
        symbol: '₱',
        name: 'Philippine Peso',
        decimalPlaces: 2,
      });
      expect(SUPPORTED_CURRENCIES.USD).toEqual({
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
        decimalPlaces: 2,
      });
      expect(SUPPORTED_CURRENCIES.EUR).toEqual({
        code: 'EUR',
        symbol: '€',
        name: 'Euro',
        decimalPlaces: 2,
      });
      expect(SUPPORTED_CURRENCIES.GBP).toEqual({
        code: 'GBP',
        symbol: '£',
        name: 'British Pound',
        decimalPlaces: 2,
      });
      expect(SUPPORTED_CURRENCIES.JPY).toEqual({
        code: 'JPY',
        symbol: '¥',
        name: 'Japanese Yen',
        decimalPlaces: 0,
      });
      expect(SUPPORTED_CURRENCIES.CAD).toBeDefined();
      expect(SUPPORTED_CURRENCIES.AUD).toBeDefined();
      expect(SUPPORTED_CURRENCIES.SGD).toBeDefined();
    });
  });

  describe('formatCurrency', () => {
    it('should format positive amounts in default currency (PHP)', () => {
      expect(formatCurrency(1250.5)).toBe('₱1,250.50');
      expect(formatCurrency(100)).toBe('₱100.00');
      expect(formatCurrency(0.99)).toBe('₱0.99');
    });

    it('should format zero correctly', () => {
      expect(formatCurrency(0)).toBe('₱0.00');
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
      expect(formatCurrency(0, 'JPY')).toBe('¥0');
    });

    it('should format negative numbers with a leading minus sign', () => {
      expect(formatCurrency(-500)).toBe('-₱500.00');
      expect(formatCurrency(-1250.75)).toBe('-₱1,250.75');
      expect(formatCurrency(-100, 'USD')).toBe('-$100.00');
      expect(formatCurrency(-2500, 'JPY')).toBe('-¥2,500');
    });

    it('should format large numbers with commas', () => {
      expect(formatCurrency(1000000)).toBe('₱1,000,000.00');
      expect(formatCurrency(1234567890.12)).toBe('₱1,234,567,890.12');
      expect(formatCurrency(-987654321.5)).toBe('-₱987,654,321.50');
    });

    it('should support various international currencies', () => {
      expect(formatCurrency(50.25, 'USD')).toBe('$50.25');
      expect(formatCurrency(75.5, 'EUR')).toBe('€75.50');
      expect(formatCurrency(120.0, 'GBP')).toBe('£120.00');
      expect(formatCurrency(5000, 'JPY')).toBe('¥5,000');
      expect(formatCurrency(45.99, 'CAD')).toBe('$45.99');
      expect(formatCurrency(88.88, 'AUD')).toBe('$88.88');
      expect(formatCurrency(15.5, 'SGD')).toBe('S$15.50');
    });

    it('should fallback to PHP for unknown or unsupported currency codes', () => {
      expect(formatCurrency(100, 'XYZ')).toBe('₱100.00');
      expect(formatCurrency(-250, 'UNKNOWN')).toBe('-₱250.00');
    });
  });

  describe('formatCompactCurrency', () => {
    it('should format small numbers (< 1,000) without suffix', () => {
      expect(formatCompactCurrency(0)).toBe('₱0');
      expect(formatCompactCurrency(45)).toBe('₱45');
      expect(formatCompactCurrency(999)).toBe('₱999');
    });

    it('should format thousands (>= 1,000 and < 1,000,000) with "k" suffix', () => {
      expect(formatCompactCurrency(1000)).toBe('₱1.0k');
      expect(formatCompactCurrency(1250)).toBe('₱1.3k');
      expect(formatCompactCurrency(15000)).toBe('₱15.0k');
      expect(formatCompactCurrency(999999)).toBe('₱1000.0k');
    });

    it('should format millions (>= 1,000,000 and < 1,000,000,000) with "M" suffix', () => {
      expect(formatCompactCurrency(1000000)).toBe('₱1.0M');
      expect(formatCompactCurrency(1250000)).toBe('₱1.3M');
      expect(formatCompactCurrency(25000000)).toBe('₱25.0M');
      expect(formatCompactCurrency(999900000)).toBe('₱999.9M');
    });

    it('should format billions (>= 1,000,000,000) with "B" suffix', () => {
      expect(formatCompactCurrency(1000000000)).toBe('₱1.0B');
      expect(formatCompactCurrency(2500000000)).toBe('₱2.5B');
      expect(formatCompactCurrency(100000000000)).toBe('₱100.0B');
    });

    it('should format negative numbers compactly with a leading minus sign', () => {
      expect(formatCompactCurrency(-500)).toBe('-₱500');
      expect(formatCompactCurrency(-1500)).toBe('-₱1.5k');
      expect(formatCompactCurrency(-2500000)).toBe('-₱2.5M');
      expect(formatCompactCurrency(-5000000000)).toBe('-₱5.0B');
    });

    it('should format compact currency using different currency symbols', () => {
      expect(formatCompactCurrency(1500, 'USD')).toBe('$1.5k');
      expect(formatCompactCurrency(2500000, 'EUR')).toBe('€2.5M');
      expect(formatCompactCurrency(1000000000, 'GBP')).toBe('£1.0B');
      expect(formatCompactCurrency(500, 'JPY')).toBe('¥500');
      expect(formatCompactCurrency(10000, 'SGD')).toBe('S$10.0k');
    });

    it('should fallback to PHP for unknown currency code in compact formatting', () => {
      expect(formatCompactCurrency(1500, 'INVALID')).toBe('₱1.5k');
    });
  });
});
