/**
 * Security utilities for sanitizing user input
 */

import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Checks if a URL is safe for use in image sources
 * Blocks dangerous protocols like javascript:, vbscript:, and file:
 * @param url - The URL to validate
 * @returns True if the URL is safe for image display
 * @example
 * ```typescript
 * isSafeImageUrl('https://example.com/image.jpg') // true
 * isSafeImageUrl('javascript:alert(1)') // false
 * isSafeImageUrl('data:image/png;base64,...') // true
 * ```
 */
export function isSafeImageUrl(url: string): boolean {
  const allowedProtocols = ['http:', 'https:', 'data:image/'];
  const urlLower = url.toLowerCase().trim();

  // Block javascript: and other dangerous protocols
  if (
    urlLower.startsWith('javascript:') ||
    urlLower.startsWith('vbscript:') ||
    urlLower.startsWith('file:')
  ) {
    return false;
  }

  return allowedProtocols.some((protocol) => urlLower.startsWith(protocol));
}

/**
 * Sanitizes an image URL using Angular's DomSanitizer
 * @param sanitizer - Angular's DomSanitizer service
 * @param url - The URL to sanitize
 * @returns The sanitized URL or null if unsafe
 * @example
 * ```typescript
 * const sanitizer = inject(DomSanitizer);
 * const safeUrl = sanitizeImageUrl(sanitizer, userProvidedUrl);
 * ```
 */
export function sanitizeImageUrl(
  sanitizer: DomSanitizer,
  url: string | undefined | null
): string | null {
  if (!url || !isSafeImageUrl(url)) {
    return null;
  }
  return sanitizer.sanitize(SecurityContext.URL, url);
}
