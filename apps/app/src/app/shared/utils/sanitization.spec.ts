import { describe, it, expect } from 'vitest';
import { isSafeImageUrl } from './sanitization';

describe('sanitization utilities', () => {
  describe('isSafeImageUrl', () => {
    it('should allow http URLs', () => {
      expect(isSafeImageUrl('http://example.com/image.jpg')).toBe(true);
      expect(isSafeImageUrl('http://cdn.example.com/path/to/image.png')).toBe(
        true
      );
    });

    it('should allow https URLs', () => {
      expect(isSafeImageUrl('https://example.com/image.jpg')).toBe(true);
      expect(isSafeImageUrl('https://cdn.example.com/path/to/image.png')).toBe(
        true
      );
    });

    it('should allow data:image/ URLs', () => {
      expect(isSafeImageUrl('data:image/png;base64,iVBORw0KG==')).toBe(true);
      expect(isSafeImageUrl('data:image/jpeg;base64,/9j/4AAQ')).toBe(true);
      expect(isSafeImageUrl('data:image/svg+xml;base64,PHN2Zw==')).toBe(true);
    });

    it('should block javascript: protocol', () => {
      expect(isSafeImageUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeImageUrl('JavaScript:alert(1)')).toBe(false);
      expect(isSafeImageUrl('JAVASCRIPT:alert(1)')).toBe(false);
    });

    it('should block vbscript: protocol', () => {
      expect(isSafeImageUrl('vbscript:msgbox(1)')).toBe(false);
      expect(isSafeImageUrl('VBScript:msgbox(1)')).toBe(false);
    });

    it('should block file: protocol', () => {
      expect(isSafeImageUrl('file:///etc/passwd')).toBe(false);
      expect(isSafeImageUrl('FILE:///C:/Windows/System32')).toBe(false);
    });

    it('should handle URLs with whitespace', () => {
      expect(isSafeImageUrl('  https://example.com/image.jpg  ')).toBe(true);
      expect(isSafeImageUrl('  javascript:alert(1)  ')).toBe(false);
    });

    it('should block data URLs that are not images', () => {
      expect(isSafeImageUrl('data:text/html,<script>alert(1)</script>')).toBe(
        false
      );
      expect(isSafeImageUrl('data:application/javascript,alert(1)')).toBe(
        false
      );
    });

    it('should handle mixed case protocols', () => {
      expect(isSafeImageUrl('HTTP://example.com/image.jpg')).toBe(true);
      expect(isSafeImageUrl('HTTPS://example.com/image.jpg')).toBe(true);
      expect(isSafeImageUrl('DATA:IMAGE/PNG;base64,abc')).toBe(true);
    });
  });
});
