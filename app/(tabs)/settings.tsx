import { useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground } from '@/src/components/AppBackground';
import { EmptyState } from '@/src/components/EmptyState';
import { ErrorBanner } from '@/src/components/ErrorBanner';
import { SectionHeader } from '@/src/components/SectionHeader';
import { Surface } from '@/src/components/Surface';
import { TokenChip } from '@/src/components/TokenChip';
import { exportCollectionToJson } from '@/src/services/export-service';
import { useCollectionStore } from '@/src/store/collection-store';
import { formatRelativeDate } from '@/src/utils/date';

export default function SettingsScreen() {
  const collection = useCollectionStore((state) => state.collection);
  const settings = useCollectionStore((state) => state.settings);
  const errorMessage = useCollectionStore((state) => state.errorMessage);
  const clearError = useCollectionStore((state) => state.clearError);
  const updateSettings = useCollectionStore((state) => state.updateSettings);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!settings) {
      return;
    }

    try {
      setIsExporting(true);
      const fileUri = await exportCollectionToJson(collection, settings);
      Alert.alert('Export ready', `Collection export written to ${fileUri}`);
    } catch (error) {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Unable to export your collection.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppBackground>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="gap-4 px-5 pb-32 pt-4">
            <SectionHeader
              eyebrow="Settings"
              title="Collection controls"
              subtitle="Tune price refresh behavior, choose defaults, and export your local on-device data."
            />

            {errorMessage ? <ErrorBanner message={errorMessage} onDismiss={clearError} /> : null}

            {!settings ? (
              <EmptyState
                icon="cog-outline"
                title="Settings unavailable"
                description="The app is still loading its local preferences."
              />
            ) : (
              <>
                <Surface className="gap-4">
                  <Text className="font-display text-[30px] leading-7 text-obsidian dark:text-parchment">
                    Pricing
                  </Text>
                  <View className="flex-row items-center justify-between gap-4">
                    <View className="flex-1">
                      <Text className="font-body text-2xl leading-5 text-obsidian dark:text-parchment">
                        Refresh prices on launch
                      </Text>
                      <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                        Uses Scryfall USD pricing when the app opens.
                      </Text>
                    </View>
                    <Switch
                      value={settings.autoRefreshOnLaunch}
                      onValueChange={(value) => void updateSettings({ autoRefreshOnLaunch: value })}
                      thumbColor={settings.autoRefreshOnLaunch ? '#dc6a40' : '#d7d1c5'}
                    />
                  </View>
                  <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                    Last refresh: {formatRelativeDate(settings.lastPriceRefreshAt)}
                  </Text>
                </Surface>

                <Surface className="gap-4">
                  <Text className="font-display text-[30px] leading-7 text-obsidian dark:text-parchment">
                    Add defaults
                  </Text>
                  <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                    Choose the finish preselected in search results and scan confirmations.
                  </Text>
                  <View className="flex-row gap-2">
                    <TokenChip
                      label="Non-foil"
                      active={settings.defaultFinish === 'nonfoil'}
                      onPress={() => void updateSettings({ defaultFinish: 'nonfoil' })}
                    />
                    <TokenChip
                      label="Foil"
                      active={settings.defaultFinish === 'foil'}
                      onPress={() => void updateSettings({ defaultFinish: 'foil' })}
                      tone="accent"
                    />
                  </View>
                </Surface>

                <Surface className="gap-4">
                  <Text className="font-display text-[30px] leading-7 text-obsidian dark:text-parchment">
                    Library view
                  </Text>
                  <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                    Switch between a detailed list and a compact grid on the Collection tab.
                  </Text>
                  <View className="flex-row gap-2">
                    <TokenChip
                      label="List"
                      active={settings.collectionLayout === 'list'}
                      onPress={() => void updateSettings({ collectionLayout: 'list' })}
                    />
                    <TokenChip
                      label="Grid"
                      active={settings.collectionLayout === 'grid'}
                      onPress={() => void updateSettings({ collectionLayout: 'grid' })}
                    />
                  </View>
                </Surface>

                <Surface className="gap-4">
              <Text className="font-display text-[30px] leading-7 text-obsidian dark:text-parchment">
                Export
              </Text>
              <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                    Export the local on-device collection and settings as a JSON file you can share or archive.
              </Text>
                  <Pressable
                    className="rounded-full bg-obsidian px-4 py-4 dark:bg-parchment"
                    disabled={isExporting}
                    onPress={() => void handleExport()}>
                    <Text className="text-center font-body text-xl uppercase tracking-[1.4px] text-parchment dark:text-night">
                      {isExporting ? 'Exporting…' : 'Export collection JSON'}
                    </Text>
                  </Pressable>
                </Surface>

                <Surface className="gap-3">
                  <Text className="font-display text-[30px] leading-7 text-obsidian dark:text-parchment">
                    App notes
                  </Text>
                  <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                    Collection data remains available offline from local storage.
                  </Text>
                  <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                    Camera OCR requires an Android development build because the text extractor is a native Expo module.
                  </Text>
              <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                    Current vault size: {collection.length} unique cards.
              </Text>
                </Surface>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}
