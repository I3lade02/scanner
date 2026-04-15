import type { CollectionEntry, CollectionFilters, CollectionSortKey, CollectionSummary } from '@/src/types/collection';

export function getCollectionSummary(entries: CollectionEntry[]): CollectionSummary {
  return entries.reduce<CollectionSummary>(
    (summary, entry) => ({
      uniqueCards: summary.uniqueCards + 1,
      totalCards: summary.totalCards + entry.quantity,
      totalValue: summary.totalValue + entry.totalValue,
    }),
    {
      uniqueCards: 0,
      totalCards: 0,
      totalValue: 0,
    }
  );
}

export function filterAndSortCollection(
  entries: CollectionEntry[],
  searchTerm: string,
  sortKey: CollectionSortKey,
  filters: CollectionFilters
): CollectionEntry[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filtered = entries.filter((entry) => {
    if (normalizedSearch) {
      const haystack = `${entry.name} ${entry.setName} ${entry.collectorNumber ?? ''}`.toLowerCase();
      if (!haystack.includes(normalizedSearch)) {
        return false;
      }
    }

    if (filters.rarity && entry.rarity !== filters.rarity) {
      return false;
    }

    if (filters.color && !entry.colors.includes(filters.color)) {
      return false;
    }

    if (filters.setCode && entry.setCode !== filters.setCode) {
      return false;
    }

    return true;
  });

  return filtered.sort((left, right) => {
    if (sortKey === 'name') {
      return left.name.localeCompare(right.name);
    }

    if (sortKey === 'price') {
      return right.price - left.price;
    }

    if (sortKey === 'quantity') {
      return right.quantity - left.quantity;
    }

    return right.totalValue - left.totalValue;
  });
}
