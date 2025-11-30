import { describe, it, expect } from 'vitest';
import { SearchIndex } from './search-index';

interface TestItem {
  id: string;
  name: string;
  description?: string|undefined;
  altNames?: string[] | undefined;
}

describe('SearchIndex', () => {
  const exercises: TestItem[] = [
    { id: '1', name: 'Bent Over Two Dumbbell Row', altNames: ['DB Row', 'Dumbbell Row'] },
    { id: '2', name: 'Barbell Bench Press', description: 'Classic chest exercise' },
    { id: '3', name: 'Pull Up', altNames: ['Chin Up'] },
    { id: '4', name: 'Deadlift', description: 'Compound back exercise' },
    { id: '5', name: 'Dumbbell Shoulder Press', altNames: ['Overhead Press'] },
  ];

  const createIndex = (items: TestItem[] = exercises) =>
    new SearchIndex(items, (item) => [
      item.name,
      item.description,
      ...(item.altNames || []),
    ]);

  describe('basic search functionality', () => {
    it('should return all items when query is empty', () => {
      const index = createIndex();
      expect(index.search('')).toHaveLength(5);
      expect(index.search('   ')).toHaveLength(5);
    });

    it('should find items by exact word match', () => {
      const index = createIndex();
      const results = index.search('deadlift');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('4');
    });

    it('should be case insensitive', () => {
      const index = createIndex();
      expect(index.search('DEADLIFT')).toHaveLength(1);
      expect(index.search('DeadLift')).toHaveLength(1);
      expect(index.search('deadlift')).toHaveLength(1);
    });

    it('should find items by partial word (prefix match)', () => {
      const index = createIndex();
      const results = index.search('dead');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('4');
    });
  });

  describe('multi-word search (fuzzy matching)', () => {
    it('should find "Bent Over Two Dumbbell Row" from "dumbbell row"', () => {
      const index = createIndex();
      const results = index.search('dumbbell row');
      expect(results.some(r => r.id === '1')).toBe(true);
    });

    it('should find "Bent Over Two Dumbbell Row" from "bent-over row"', () => {
      const index = createIndex();
      const results = index.search('bent-over row');
      expect(results.some(r => r.id === '1')).toBe(true);
    });

    it('should find "Bent Over Two Dumbbell Row" from "dumbbell bent-over row"', () => {
      const index = createIndex();
      const results = index.search('dumbbell bent-over row');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });

    it('should require ALL words to match', () => {
      const index = createIndex();
      // "dumbbell" and "bench" don't both appear in any single item
      const results = index.search('dumbbell bench');
      expect(results).toHaveLength(0);
    });

    it('should match words in any order', () => {
      const index = createIndex();
      const results1 = index.search('press bench');
      const results2 = index.search('bench press');
      expect(results1).toHaveLength(1);
      expect(results2).toHaveLength(1);
      expect(results1[0].id).toBe(results2[0].id);
    });
  });

  describe('alternative names search', () => {
    it('should find items by alternative name', () => {
      const index = createIndex();
      const results = index.search('chin up');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('3');
      expect(results[0].name).toBe('Pull Up');
    });

    it('should find items by partial alternative name', () => {
      const index = createIndex();
      const results = index.search('overhead');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('5');
    });

    it('should find items combining name and alt name terms', () => {
      const index = createIndex();
      // "DB" is in altNames, "Row" is in name
      const results = index.search('db row');
      expect(results.some(r => r.id === '1')).toBe(true);
    });
  });

  describe('description search', () => {
    it('should find items by description', () => {
      const index = createIndex();
      const results = index.search('chest exercise');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('2');
    });

    it('should find items combining name and description terms', () => {
      const index = createIndex();
      const results = index.search('deadlift compound');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('4');
    });
  });

  describe('tokenization', () => {
    it('should handle hyphenated words', () => {
      const index = createIndex();
      // "bent-over" should be tokenized into "bent" and "over"
      const results = index.search('bent over');
      expect(results.some(r => r.id === '1')).toBe(true);
    });

    it('should ignore short tokens (< 2 chars)', () => {
      const index = createIndex();
      // "a" should be ignored, only "row" should match
      const results = index.search('a row');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle punctuation in search query', () => {
      const index = createIndex();
      const results = index.search('dumbbell, row!');
      expect(results.some(r => r.id === '1')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return empty array for non-matching query', () => {
      const index = createIndex();
      const results = index.search('nonexistent exercise xyz');
      expect(results).toHaveLength(0);
    });

    it('should handle empty item list', () => {
      const index = createIndex([]);
      expect(index.search('')).toHaveLength(0);
      expect(index.search('test')).toHaveLength(0);
    });

    it('should handle items with undefined/null fields gracefully', () => {
      const itemsWithNulls: TestItem[] = [
        { id: '1', name: 'Test Exercise', description: undefined, altNames: undefined },
        { id: '2', name: 'Another Exercise', altNames: [] },
      ];
      const index = createIndex(itemsWithNulls);

      expect(index.search('test')).toHaveLength(1);
      expect(index.search('another')).toHaveLength(1);
    });

    it('should handle special regex characters in search', () => {
      const items: TestItem[] = [
        { id: '1', name: 'Test (Exercise)' },
        { id: '2', name: 'Test [Bracket]' },
      ];
      const index = createIndex(items);

      // These shouldn't throw regex errors
      expect(() => index.search('(exercise)')).not.toThrow();
      expect(() => index.search('[bracket]')).not.toThrow();
    });
  });

  describe('performance characteristics', () => {
    it('should handle larger datasets efficiently', () => {
      // Generate 1000 items
      const largeDataset: TestItem[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        name: `Exercise ${i} ${i % 10 === 0 ? 'Special' : 'Regular'}`,
        description: i % 5 === 0 ? 'With description' : undefined,
        altNames: i % 3 === 0 ? [`Alt ${i}`] : undefined,
      }));

      const index = createIndex(largeDataset);

      // Search should complete quickly
      const start = performance.now();
      const results = index.search('special');
      const duration = performance.now() - start;

      expect(results).toHaveLength(100); // Every 10th item has "Special"
      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });

    it('should return consistent results across multiple searches', () => {
      const index = createIndex();

      const results1 = index.search('dumbbell');
      const results2 = index.search('dumbbell');

      expect(results1).toEqual(results2);
    });
  });

  describe('real-world exercise search scenarios', () => {
    const realExercises: TestItem[] = [
      { id: '1', name: 'Bent Over Two Dumbbell Row', altNames: ['Bent Over Dumbbell Row', 'DB Row'] },
      { id: '2', name: 'Barbell Row', altNames: ['Pendlay Row'] },
      { id: '3', name: 'Single Arm Dumbbell Row', altNames: ['One Arm Row'] },
      { id: '4', name: 'Cable Row', altNames: ['Seated Cable Row'] },
      { id: '5', name: 'T-Bar Row' },
    ];

    it('should find all row exercises when searching "row"', () => {
      const index = createIndex(realExercises);
      const results = index.search('row');
      expect(results).toHaveLength(5);
    });

    it('should narrow down to dumbbell rows when searching "dumbbell row"', () => {
      const index = createIndex(realExercises);
      const results = index.search('dumbbell row');
      expect(results).toHaveLength(2);
      expect(results.map(r => r.id).sort()).toEqual(['1', '3']);
    });

    it('should find single arm exercises', () => {
      const index = createIndex(realExercises);
      const results = index.search('single arm');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('3');
    });

    it('should find by alternative name "pendlay"', () => {
      const index = createIndex(realExercises);
      const results = index.search('pendlay');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('2');
    });
  });
});
