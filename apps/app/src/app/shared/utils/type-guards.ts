/**
 * Type guard utilities for safe type checking and conversion
 */

/**
 * Checks if a value is a valid enum member
 * @param value - The value to check
 * @param enumObj - The enum object to validate against
 * @returns True if value is a valid enum member
 * @example
 * ```typescript
 * enum Color { Red = 'red', Blue = 'blue' }
 * isValidEnumValue('red', Color) // true
 * isValidEnumValue('green', Color) // false
 * ```
 */
export function isValidEnumValue<T extends Record<string, string>>(
  value: unknown,
  enumObj: T
): value is T[keyof T] {
  return Object.values(enumObj).includes(value as string);
}

/**
 * Safely extracts an error message from an unknown error value
 * @param error - The error value (can be Error, string, object, or anything)
 * @returns A human-readable error message
 * @example
 * ```typescript
 * safeErrorMessage(new Error('Oops')) // 'Oops'
 * safeErrorMessage('String error') // 'String error'
 * safeErrorMessage({ message: 'Custom' }) // 'Custom'
 * safeErrorMessage(null) // 'An unexpected error occurred'
 * ```
 */
export function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unexpected error occurred';
}

/**
 * Safely converts a value to a number with a fallback default
 * @param value - The value to convert to a number
 * @param defaultValue - The default value if conversion fails (default: 0)
 * @returns The converted number or the default value
 * @example
 * ```typescript
 * safeNumberConversion('42') // 42
 * safeNumberConversion('invalid') // 0
 * safeNumberConversion('invalid', 10) // 10
 * safeNumberConversion(null, 5) // 5
 * ```
 */
export function safeNumberConversion(value: unknown, defaultValue = 0): number {
  // Handle null, undefined, and empty string explicitly
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}
