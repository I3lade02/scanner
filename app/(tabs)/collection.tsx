import { Link, useRouter } from 'expo-router';
import { useDeferredValue, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground } from '@/src/components/AppBackground';
import { CardPrint } from '@/src/components/CardPrint';
import { CollectionCard } from '@/src/components/CollectionCard';
import { EmptyState } from '@/src/components/EmptyState';
import { ErrorBanner } from '@/src/components/ErrorBanner';
import { SectionHeader } from '@/src/components/SectionHeader';
import { Surface } from '@/src/components/Surface';
import { TokenChip } from '@/src/components/TokenChip';
import { filterAndSortCollection } from '@/src/features/collection/selectors';
import { useCollectionStore } from '@/src/store/collection-store';
import type { CollectionFilters, CollectionSortKey } from '@/src/types/collection';
import { formatCurrency } from '@/src/utils/currency';

const SORT_OPTIONS: { key: CollectionSortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'price', label: 'Price' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'totalValue', label: 'Total value' },
];

const RARITY_OPTIONS = ['common', 'uncommon', 'rare', 'mythic'];

export default function CollectionScreen() {
  const router = useRouter();
  const collection = useCollectionStore((state) => state.collection);
  const settings = useCollectionStore((state) => state.settings);
  const errorMessage = useCollectionStore((state) => state.errorMessage);
  const clearError = useCollectionStore((state) => state.clearError);
  const incrementQuantity = useCollectionStore((state) => state.incrementQuantity);
  const removeCard = useCollectionStore((state) => state.removeCard);
  const refreshPrices = useCollectionStore((state) => state.refreshPrices);
  const isRefreshingPrices = useCollectionStore((state) => state.isRefreshingPrices);
  const updateSettings = useCollectionStore((state) => state.updateSettings);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<CollectionSortKey>('totalValue');
  const [filters, setFilters] = useState<CollectionFilters>({});
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const colors = useMemo(
    () =>
      Array.from(
        new Set(
          collection
            .flatMap((entry) => entry.colors)
            .filter(Boolean)
            .sort()
        )
      ),
    [collection]
  );

  const filteredEntries = useMemo(
    () => filterAndSortCollection(collection, deferredSearchTerm, sortKey, filters),
    [collection, deferredSearchTerm, filters, sortKey]
  );

  const isGrid = settings?.collectionLayout === 'grid';

  return (
    <AppBackground>
      <SafeAreaView className="flex-1" edges={['top']}>
        <FlatList
          key={isGrid ? 'grid' : 'list'}
          data={filteredEntries}
          numColumns={isGrid ? 2 : 1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 20, paddingTop: 16, gap: 16 }}
          columnWrapperStyle={isGrid ? { gap: 12 } : undefined}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshingPrices}
              onRefresh={() => void refreshPrices()}
              tintColor="#dc6a40"
            />
          }
          ListHeaderComponent={
            <View className="gap-4 pb-4">
              <SectionHeader
                eyebrow="Collection"
                title="Your cards"
                subtitle="Search your local vault, sort by value, and manage quantities offline."
                action={
                  <View className="flex-row gap-2">
                    <TokenChip
                      label="List"
                      active={!isGrid}
                      onPress={() => void updateSettings({ collectionLayout: 'list' })}
                    />
                    <TokenChip
                      label="Grid"
                      active={isGrid}
                      onPress={() => void updateSettings({ collectionLayout: 'grid' })}
                    />
                  </View>
                }
              />

              {errorMessage ? <ErrorBanner message={errorMessage} onDismiss={clearError} /> : null}

              <Surface className="gap-3 p-4">
                <TextInput
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholder="Search name, set, or collector number"
                  placeholderTextColor="#7e877f"
                  autoCorrect={false}
                  className="rounded-[22px] border border-sand bg-white/80 px-4 py-3 font-body text-2xl text-obsidian dark:border-ink dark:bg-night/60 dark:text-parchment"
                />
                <View className="gap-3">
                  <View className="flex-row flex-wrap gap-2">
                    {SORT_OPTIONS.map((option) => (
                      <TokenChip
                        key={option.key}
                        label={option.label}
                        active={sortKey === option.key}
                        onPress={() => setSortKey(option.key)}
                      />
                    ))}
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {RARITY_OPTIONS.map((rarity) => (
                      <TokenChip
                        key={rarity}
                        label={rarity}
                        active={filters.rarity === rarity}
                        onPress={() =>
                          setFilters((current) => ({
                            ...current,
                            rarity: current.rarity === rarity ? undefined : rarity,
                          }))
                        }
                      />
                    ))}
                  </View>
                  {colors.length ? (
                    <View className="flex-row flex-wrap gap-2">
                      {colors.map((color) => (
                        <TokenChip
                          key={color}
                          label={color}
                          active={filters.color === color}
                          onPress={() =>
                            setFilters((current) => ({
                              ...current,
                              color: current.color === color ? undefined : color,
                            }))
                          }
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
              </Surface>
            </View>
          }
          ListEmptyComponent={
            collection.length ? (
              <EmptyState
                icon="magnify"
                title="No matches"
                description="Try a different search term, clear a filter, or switch the sort mode."
              />
            ) : (
              <EmptyState
                icon="cards-outline"
                title="Your vault is empty"
                description="Search for cards or scan one with the camera to create your first collection entry."
                actionLabel="Open search"
                onAction={() => router.push('/(tabs)/search')}
              />
            )
          }
          renderItem={({ item }) =>
            isGrid ? (
              <Link href={{ pathname: '/card/[id]', params: { id: item.id } }} asChild>
                <Pressable className="mb-3 flex-1">
                  <Surface className="gap-3 p-3">
                    <CardPrint imageUrl={item.imageUrl ?? item.smallImageUrl} className="w-full" />
                    <View className="gap-1">
                      <Text className="font-display text-[24px] leading-6 text-obsidian dark:text-parchment">
                        {item.name}
                      </Text>
                      <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                        {item.setCode} • {item.finish}
                      </Text>
                      <Text className="font-display text-[22px] leading-6 text-obsidian dark:text-parchment">
                        {formatCurrency(item.totalValue)}
                      </Text>
                    </View>
                  </Surface>
                </Pressable>
              </Link>
            ) : (
              <View className="mb-3">
                <CollectionCard
                  entry={item}
                  onDecrease={() => void incrementQuantity(item.id, -1)}
                  onIncrease={() => void incrementQuantity(item.id, 1)}
                  onRemove={() => void removeCard(item.id)}
                />
              </View>
            )
          }
        />
      </SafeAreaView>
    </AppBackground>
  );
}
