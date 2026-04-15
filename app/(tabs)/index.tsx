import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground } from '@/src/components/AppBackground';
import { CardPrint } from '@/src/components/CardPrint';
import { EmptyState } from '@/src/components/EmptyState';
import { ErrorBanner } from '@/src/components/ErrorBanner';
import { SectionHeader } from '@/src/components/SectionHeader';
import { StatCard } from '@/src/components/StatCard';
import { Surface } from '@/src/components/Surface';
import { getCollectionSummary } from '@/src/features/collection/selectors';
import { useCollectionStore } from '@/src/store/collection-store';
import { formatCurrency } from '@/src/utils/currency';

export default function HomeScreen() {
  const router = useRouter();
  const collection = useCollectionStore((state) => state.collection);
  const isRefreshingPrices = useCollectionStore((state) => state.isRefreshingPrices);
  const refreshPrices = useCollectionStore((state) => state.refreshPrices);
  const errorMessage = useCollectionStore((state) => state.errorMessage);
  const clearError = useCollectionStore((state) => state.clearError);
  const summary = useMemo(() => getCollectionSummary(collection), [collection]);
  const recentEntries = useMemo(() => collection.slice(0, 3), [collection]);
  const topValueEntries = useMemo(
    () => [...collection].sort((left, right) => right.totalValue - left.totalValue).slice(0, 3),
    [collection]
  );

  return (
    <AppBackground>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshingPrices}
              onRefresh={() => void refreshPrices()}
              tintColor="#dc6a40"
            />
          }>
          <View className="gap-4 px-5 pb-32 pt-4">
            <SectionHeader
              eyebrow="Mana Vault"
              title="Collection at a glance"
              subtitle="Track every printing, keep live prices handy, and scan new cards straight into your vault."
              action={
                <Pressable
                  className="rounded-full border border-sand bg-white/80 px-4 py-3 dark:border-ink dark:bg-night/50"
                  disabled={!collection.length}
                  onPress={() => void refreshPrices()}>
                  <MaterialCommunityIcons name="refresh" size={20} color="#dc6a40" />
                </Pressable>
              }
            />

            {errorMessage ? <ErrorBanner message={errorMessage} onDismiss={clearError} /> : null}

            {collection.length ? (
              <>
                <View className="flex-row gap-3">
                  <StatCard
                    label="Unique"
                    value={summary.uniqueCards.toString()}
                    hint="Different printings in your vault"
                    icon={<MaterialCommunityIcons name="cards-outline" size={22} color="#2e6f5e" />}
                  />
                  <StatCard
                    label="Copies"
                    value={summary.totalCards.toString()}
                    hint="All owned cards combined"
                    icon={<MaterialCommunityIcons name="layers-triple-outline" size={22} color="#b98f53" />}
                  />
                </View>
                <View className="flex-row gap-3">
                  <StatCard
                    label="Value"
                    value={formatCurrency(summary.totalValue)}
                    hint="Scryfall USD snapshot"
                    icon={<MaterialCommunityIcons name="cash-multiple" size={22} color="#dc6a40" />}
                  />
                </View>
              </>
            ) : (
              <EmptyState
                icon="cards-outline"
                title="No cards yet"
                description="Search for any Magic card or scan a physical card to start building your local collection."
                actionLabel="Start searching"
                onAction={() => router.push('/(tabs)/search')}
              />
            )}

            <SectionHeader title="Quick actions" subtitle="Jump straight into the common flows." />
            <View className="gap-3">
              <Link href="/(tabs)/search" asChild>
                <Pressable>
                  <Surface className="flex-row items-center justify-between gap-4">
                    <View className="flex-1">
                      <Text className="font-display text-[28px] leading-7 text-obsidian dark:text-parchment">
                        Add with search
                      </Text>
                      <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                        Search Scryfall, pick an exact printing, then add regular or foil copies.
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="magnify" size={26} color="#dc6a40" />
                  </Surface>
                </Pressable>
              </Link>
              <Link href="/(tabs)/scan" asChild>
                <Pressable>
                  <Surface className="flex-row items-center justify-between gap-4">
                    <View className="flex-1">
                      <Text className="font-display text-[28px] leading-7 text-obsidian dark:text-parchment">
                        Scan a card
                      </Text>
                      <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                        Use the camera overlay and OCR flow to match a printed card quickly.
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="camera-outline" size={26} color="#2e6f5e" />
                  </Surface>
                </Pressable>
              </Link>
            </View>

            {collection.length ? (
              <>
                <SectionHeader title="Recently updated" subtitle="The newest items in your vault." />
                <View className="gap-3">
                  {recentEntries.map((entry) => (
                    <Link key={entry.id} href={{ pathname: '/card/[id]', params: { id: entry.id } }} asChild>
                      <Pressable>
                        <Surface className="flex-row items-center gap-4 py-4">
                          <CardPrint imageUrl={entry.imageUrl ?? entry.smallImageUrl} className="w-24 shrink-0" />
                          <View className="flex-1 gap-1">
                            <Text className="font-display text-[28px] leading-7 text-obsidian dark:text-parchment">
                              {entry.name}
                            </Text>
                            <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                              {entry.setCode} • {entry.finish} • {entry.quantity} owned
                            </Text>
                            <Text className="font-display text-[26px] leading-7 text-obsidian dark:text-parchment">
                              {formatCurrency(entry.totalValue)}
                            </Text>
                          </View>
                        </Surface>
                      </Pressable>
                    </Link>
                  ))}
                </View>

                <SectionHeader title="Highest value" subtitle="Top cards by total owned value." />
                <View className="gap-3">
                  {topValueEntries.map((entry) => (
                    <Link key={entry.id} href={{ pathname: '/card/[id]', params: { id: entry.id } }} asChild>
                      <Pressable>
                        <Surface className="flex-row items-center gap-4 py-4">
                          <CardPrint imageUrl={entry.imageUrl ?? entry.smallImageUrl} className="w-24 shrink-0" />
                          <View className="flex-1 gap-1">
                            <Text className="font-display text-[28px] leading-7 text-obsidian dark:text-parchment">
                              {entry.name}
                            </Text>
                            <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                              {entry.quantity} copies • {formatCurrency(entry.price)} each
                            </Text>
                            <Text className="font-display text-[26px] leading-7 text-obsidian dark:text-parchment">
                              {formatCurrency(entry.totalValue)}
                            </Text>
                          </View>
                        </Surface>
                      </Pressable>
                    </Link>
                  ))}
                </View>
              </>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}
