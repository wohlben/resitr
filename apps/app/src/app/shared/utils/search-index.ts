/**
 * Client-side inverted search index for fast fuzzy text search.
 *
 * @example
 * ```typescript
 * interface Exercise { id: string; name: string; altNames?: string[] }
 *
 * const exercises = [{ id: '1', name: 'Bent Over Two Dumbbell Row', altNames: ['DB Row'] }];
 *
 * const index = new SearchIndex(exercises, (e) => [e.name, ...(e.altNames || [])]);
 *
 * index.search('dumbbell bent-over row'); // Returns matching exercises
 * ```
 */
export class SearchIndex<T> {
  private index = new Map<string, Set<T>>();
  private allItems: T[];

  /**
   * Creates a new search index.
   *
   * @param items - The items to index
   * @param getSearchableText - Function that extracts searchable text strings from an item.
   *                            All returned strings will be tokenized and indexed.
   */
  constructor(items: T[], private getSearchableText: (item: T) => (string | undefined)[]) {
    this.allItems = items;
    this.buildIndex();
  }

  /**
   * Searches the index for items matching all words in the query.
   *
   * @param query - The search query (words separated by spaces/punctuation)
   * @returns Items where all query tokens are found in the indexed text
   */
  search(query: string): T[] {
    const queryTokens = this.tokenize(query);

    if (queryTokens.length === 0) {
      return this.allItems;
    }

    // Get matching items for each token
    const matchingSets = queryTokens.map((token) => this.getMatchingItems(token));

    // If any token has no matches, return empty
    if (matchingSets.some((set) => set.size === 0)) {
      return [];
    }

    // Intersect all sets (all tokens must match)
    const result = this.intersectSets(matchingSets);

    return Array.from(result);
  }

  /**
   * Gets items that contain a specific token (exact or prefix match).
   */
  private getMatchingItems(token: string): Set<T> {
    const exactMatch = this.index.get(token);
    if (exactMatch) {
      return exactMatch;
    }

    // Fall back to prefix matching for partial words
    const result = new Set<T>();
    for (const [indexedToken, items] of this.index) {
      if (indexedToken.startsWith(token)) {
        for (const item of items) {
          result.add(item);
        }
      }
    }
    return result;
  }

  /**
   * Builds the inverted index from all items.
   */
  private buildIndex(): void {
    for (const item of this.allItems) {
      const texts = this.getSearchableText(item);
      const tokens = new Set<string>();

      for (const text of texts) {
        if (text) {
          for (const token of this.tokenize(text)) {
            tokens.add(token);
          }
        }
      }

      for (const token of tokens) {
        let itemSet = this.index.get(token);
        if (!itemSet) {
          itemSet = new Set<T>();
          this.index.set(token, itemSet);
        }
        itemSet.add(item);
      }
    }
  }

  /**
   * Tokenizes text into normalized search tokens.
   * - Converts to lowercase
   * - Splits on whitespace and punctuation
   * - Filters tokens shorter than 2 characters
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[\s\-_.,;:!?'"()[\]{}]+/)
      .filter((token) => token.length >= 2);
  }

  /**
   * Intersects multiple sets, returning items present in all sets.
   */
  private intersectSets(sets: Set<T>[]): Set<T> {
    if (sets.length === 0) {
      return new Set();
    }

    // Start with smallest set for efficiency
    const sortedSets = [...sets].sort((a, b) => a.size - b.size);
    const result = new Set(sortedSets[0]);

    for (let i = 1; i < sortedSets.length; i++) {
      for (const item of result) {
        if (!sortedSets[i].has(item)) {
          result.delete(item);
        }
      }
    }

    return result;
  }
}
