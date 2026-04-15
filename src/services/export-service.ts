import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import type { AppSettings, CollectionEntry, ExportPayload } from '@/src/types/collection';

export async function exportCollectionToJson(entries: CollectionEntry[], settings: AppSettings) {
  const payload: ExportPayload = {
    exportedAt: new Date().toISOString(),
    entries,
    settings,
  };

  const targetFile = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory}mana-vault-export-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(targetFile, JSON.stringify(payload, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(targetFile, {
      mimeType: 'application/json',
      dialogTitle: 'Export collection',
      UTI: 'public.json',
    });
  }

  return targetFile;
}
