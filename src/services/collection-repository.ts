import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, CollectionEntry } from '@/src/types/collection';

const DEFAULT_SETTINGS: AppSettings = {
  autoRefreshOnLaunch: true,
  defaultFinish: 'nonfoil',
  collectionLayout: 'grid',
  lastPriceRefreshAt: null,
};

const COLLECTION_STORAGE_KEY = 'mana-vault.collection.v1';
const SETTINGS_STORAGE_KEY = 'mana-vault.settings.v1';

async function readCollectionEntries() {
  const rawEntries = await AsyncStorage.getItem(COLLECTION_STORAGE_KEY);

  if (!rawEntries) {
    return [] as CollectionEntry[];
  }

  try {
    return JSON.parse(rawEntries) as CollectionEntry[];
  } catch {
    return [] as CollectionEntry[];
  }
}

async function writeCollectionEntries(entries: CollectionEntry[]) {
  await AsyncStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(entries));
}

export async function getCollectionEntries() {
  const entries = await readCollectionEntries();
  return entries.sort((left, right) => {
    if (left.updatedAt === right.updatedAt) {
      return left.name.localeCompare(right.name);
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export async function upsertCollectionEntry(entry: CollectionEntry) {
  const entries = await readCollectionEntries();
  const index = entries.findIndex((candidate) => candidate.id === entry.id);

  if (index === -1) {
    entries.push(entry);
  } else {
    entries[index] = entry;
  }

  await writeCollectionEntries(entries);
}

export async function deleteCollectionEntry(id: string) {
  const entries = await readCollectionEntries();
  await writeCollectionEntries(entries.filter((entry) => entry.id !== id));
}

export async function replaceCollectionEntries(entries: CollectionEntry[]) {
  await writeCollectionEntries(entries);
}

export async function getSettings() {
  const rawSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

  if (!rawSettings) {
    await saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }

  try {
    return {
      ...DEFAULT_SETTINGS,
      ...(JSON.parse(rawSettings) as Partial<AppSettings>),
    };
  } catch {
    await saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings) {
  await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
