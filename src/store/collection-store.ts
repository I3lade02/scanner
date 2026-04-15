import { create } from 'zustand';

import { deleteCollectionEntry, getCollectionEntries, getSettings, saveSettings, upsertCollectionEntry } from '@/src/services/collection-repository';
import { getCardById } from '@/src/services/scryfall-service';
import { buildCollectionEntryId, mapCardToCollectionEntry, withAdjustedQuantity } from '@/src/utils/card-mappers';
import type { AppSettings, CardFinish, CollectionEntry } from '@/src/types/collection';
import type { ScryfallCard } from '@/src/types/scryfall';

type RefreshOptions = {
  silent?: boolean;
};

type CollectionStore = {
  collection: CollectionEntry[];
  settings: AppSettings | null;
  isHydrated: boolean;
  isHydrating: boolean;
  isRefreshingPrices: boolean;
  errorMessage: string | null;
  hydrate: () => Promise<void>;
  addCard: (card: ScryfallCard, options?: { finish?: CardFinish; quantity?: number }) => Promise<CollectionEntry>;
  setQuantity: (id: string, quantity: number) => Promise<void>;
  incrementQuantity: (id: string, amount?: number) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  refreshPrices: (options?: RefreshOptions) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  clearError: () => void;
};

function sortEntries(entries: CollectionEntry[]) {
  return [...entries].sort((left, right) => {
    if (left.updatedAt === right.updatedAt) {
      return left.name.localeCompare(right.name);
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

function replaceEntry(entries: CollectionEntry[], nextEntry: CollectionEntry) {
  const index = entries.findIndex((entry) => entry.id === nextEntry.id);

  if (index === -1) {
    return sortEntries([...entries, nextEntry]);
  }

  const nextEntries = [...entries];
  nextEntries[index] = nextEntry;
  return sortEntries(nextEntries);
}

export const useCollectionStore = create<CollectionStore>((set, get) => ({
  collection: [],
  settings: null,
  isHydrated: false,
  isHydrating: false,
  isRefreshingPrices: false,
  errorMessage: null,
  async hydrate() {
    if (get().isHydrated || get().isHydrating) {
      return;
    }

    set({
      isHydrating: true,
      errorMessage: null,
    });

    try {
      const [collection, settings] = await Promise.all([getCollectionEntries(), getSettings()]);

      set({
        collection,
        settings,
        isHydrated: true,
        isHydrating: false,
      });
    } catch (error) {
      set({
        isHydrating: false,
        errorMessage: error instanceof Error ? error.message : 'Unable to load your collection.',
      });
    }
  },
  async addCard(card, options) {
    const settings = get().settings;
    const finish = options?.finish ?? settings?.defaultFinish ?? 'nonfoil';
    const quantityToAdd = options?.quantity ?? 1;
    const id = buildCollectionEntryId(card, finish);
    const existing = get().collection.find((entry) => entry.id === id);
    const nextEntry = mapCardToCollectionEntry(card, {
      finish,
      quantity: (existing?.quantity ?? 0) + quantityToAdd,
      createdAt: existing?.createdAt,
    });

    await upsertCollectionEntry(nextEntry);

    set((state) => ({
      collection: replaceEntry(state.collection, nextEntry),
      errorMessage: null,
    }));

    return nextEntry;
  },
  async setQuantity(id, quantity) {
    if (quantity <= 0) {
      await get().removeCard(id);
      return;
    }

    const existing = get().collection.find((entry) => entry.id === id);
    if (!existing) {
      return;
    }

    const nextEntry = withAdjustedQuantity(existing, quantity);
    await upsertCollectionEntry(nextEntry);

    set((state) => ({
      collection: replaceEntry(state.collection, nextEntry),
      errorMessage: null,
    }));
  },
  async incrementQuantity(id, amount = 1) {
    const existing = get().collection.find((entry) => entry.id === id);
    if (!existing) {
      return;
    }

    await get().setQuantity(id, existing.quantity + amount);
  },
  async removeCard(id) {
    await deleteCollectionEntry(id);

    set((state) => ({
      collection: state.collection.filter((entry) => entry.id !== id),
      errorMessage: null,
    }));
  },
  async refreshPrices(options) {
    const { collection } = get();

    if (!collection.length) {
      return;
    }

    set({
      isRefreshingPrices: !options?.silent,
      errorMessage: null,
    });

    try {
      const refreshedEntries = await Promise.all(
        collection.map(async (entry) => {
          const nextCard = await getCardById(entry.scryfallId);
          return mapCardToCollectionEntry(nextCard, {
            finish: entry.finish,
            quantity: entry.quantity,
            createdAt: entry.createdAt,
          });
        })
      );

      await Promise.all(refreshedEntries.map((entry) => upsertCollectionEntry(entry)));

      const settings = get().settings;
      if (settings) {
        const nextSettings: AppSettings = {
          ...settings,
          lastPriceRefreshAt: new Date().toISOString(),
        };
        await saveSettings(nextSettings);

        set({
          collection: sortEntries(refreshedEntries),
          settings: nextSettings,
          isRefreshingPrices: false,
        });
      } else {
        set({
          collection: sortEntries(refreshedEntries),
          isRefreshingPrices: false,
        });
      }
    } catch (error) {
      set({
        isRefreshingPrices: false,
        errorMessage: error instanceof Error ? error.message : 'Unable to refresh prices right now.',
      });
    }
  },
  async updateSettings(patch) {
    const current = get().settings ?? (await getSettings());
    const nextSettings = {
      ...current,
      ...patch,
    };

    await saveSettings(nextSettings);

    set({
      settings: nextSettings,
      errorMessage: null,
    });
  },
  clearError() {
    set({ errorMessage: null });
  },
}));
