import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', false && 'conditional', true && 'included');
      expect(result).not.toContain('conditional');
      expect(result).toContain('included');
    });

    it('should handle Tailwind merge conflicts', () => {
      const result = cn('px-2', 'px-4');
      // Should only keep px-4
      expect(result).toContain('px-4');
      expect(result).not.toContain('px-2');
    });

    it('should handle arrays', () => {
      const result = cn(['class1', 'class2']);
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('should handle undefined and null', () => {
      const result = cn('class1', undefined, null, 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle objects', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true,
      });
      expect(result).toContain('class1');
      expect(result).not.toContain('class2');
      expect(result).toContain('class3');
    });
  });
});
