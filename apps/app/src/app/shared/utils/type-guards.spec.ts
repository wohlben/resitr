import { describe, it, expect } from 'vitest';
import {
  isValidEnumValue,
  safeErrorMessage,
  safeNumberConversion,
} from './type-guards';

describe('type-guards utilities', () => {
  describe('isValidEnumValue', () => {
    enum TestEnum {
      Value1 = 'value1',
      Value2 = 'value2',
      Value3 = 'value3',
    }

    it('should return true for valid enum values', () => {
      expect(isValidEnumValue('value1', TestEnum)).toBe(true);
      expect(isValidEnumValue('value2', TestEnum)).toBe(true);
      expect(isValidEnumValue('value3', TestEnum)).toBe(true);
    });

    it('should return false for invalid enum values', () => {
      expect(isValidEnumValue('invalid', TestEnum)).toBe(false);
      expect(isValidEnumValue('value4', TestEnum)).toBe(false);
      expect(isValidEnumValue('', TestEnum)).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidEnumValue(null, TestEnum)).toBe(false);
      expect(isValidEnumValue(undefined, TestEnum)).toBe(false);
      expect(isValidEnumValue(123, TestEnum)).toBe(false);
      expect(isValidEnumValue({}, TestEnum)).toBe(false);
    });
  });

  describe('safeErrorMessage', () => {
    it('should extract message from Error objects', () => {
      const error = new Error('Test error');
      expect(safeErrorMessage(error)).toBe('Test error');
    });

    it('should handle string errors', () => {
      expect(safeErrorMessage('String error')).toBe('String error');
    });

    it('should extract message from objects with message property', () => {
      const errorObj = { message: 'Custom error' };
      expect(safeErrorMessage(errorObj)).toBe('Custom error');
    });

    it('should provide fallback for null/undefined', () => {
      expect(safeErrorMessage(null)).toBe('An unexpected error occurred');
      expect(safeErrorMessage(undefined)).toBe('An unexpected error occurred');
    });

    it('should provide fallback for numbers and booleans', () => {
      expect(safeErrorMessage(123)).toBe('An unexpected error occurred');
      expect(safeErrorMessage(true)).toBe('An unexpected error occurred');
    });

    it('should provide fallback for objects without message', () => {
      expect(safeErrorMessage({})).toBe('An unexpected error occurred');
      expect(safeErrorMessage({ code: 500 })).toBe(
        'An unexpected error occurred'
      );
    });
  });

  describe('safeNumberConversion', () => {
    it('should convert valid string numbers', () => {
      expect(safeNumberConversion('42')).toBe(42);
      expect(safeNumberConversion('0')).toBe(0);
      expect(safeNumberConversion('-10')).toBe(-10);
      expect(safeNumberConversion('3.14')).toBe(3.14);
    });

    it('should convert actual numbers', () => {
      expect(safeNumberConversion(42)).toBe(42);
      expect(safeNumberConversion(0)).toBe(0);
      expect(safeNumberConversion(-10)).toBe(-10);
    });

    it('should return default value for invalid conversions', () => {
      expect(safeNumberConversion('invalid')).toBe(0);
      expect(safeNumberConversion('abc')).toBe(0);
      expect(safeNumberConversion(null)).toBe(0);
      expect(safeNumberConversion(undefined)).toBe(0);
    });

    it('should use custom default value when provided', () => {
      expect(safeNumberConversion('invalid', 10)).toBe(10);
      expect(safeNumberConversion(null, 5)).toBe(5);
      expect(safeNumberConversion(undefined, -1)).toBe(-1);
    });

    it('should handle empty string', () => {
      expect(safeNumberConversion('')).toBe(0);
      expect(safeNumberConversion('', 100)).toBe(100);
    });

    it('should handle boolean values', () => {
      expect(safeNumberConversion(true)).toBe(1);
      expect(safeNumberConversion(false)).toBe(0);
    });
  });
});
