import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground } from '@/src/components/AppBackground';
import { CardPrint } from '@/src/components/CardPrint';
import { CardPrintModal } from '@/src/components/CardPrintModal';
import { EmptyState } from '@/src/components/EmptyState';
import { QuantityStepper } from '@/src/components/QuantityStepper';
import { Surface } from '@/src/components/Surface';
import { TokenChip } from '@/src/components/TokenChip';
import { useCollectionStore } from '@/src/store/collection-store';
import { formatCurrency } from '@/src/utils/currency';

export default function CardDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const entry = useCollectionStore((state) => state.collection.find((candidate) => candidate.id === params.id));
  const setQuantity = useCollectionStore((state) => state.setQuantity);
  const incrementQuantity = useCollectionStore((state) => state.incrementQuantity);
  const removeCard = useCollectionStore((state) => state.removeCard);
  const [manualQuantity, setManualQuantity] = useState(entry?.quantity.toString() ?? '1');
  const [isPrintPreviewVisible, setIsPrintPreviewVisible] = useState(false);

  useEffect(() => {
    setManualQuantity(entry?.quantity.toString() ?? '1');
  }, [entry?.quantity]);

  const oracleTextSections = useMemo(
    () => (entry?.oracleText ? entry.oracleText.split('\n\n').filter(Boolean) : []),
    [entry?.oracleText]
  );

  const handleSaveQuantity = async () => {
    if (!entry) {
      return;
    }

    const quantity = Number.parseInt(manualQuantity, 10);
    if (!Number.isFinite(quantity) || quantity < 1) {
      Alert.alert('Invalid quantity', 'Enter a whole number greater than zero.');
      return;
    }

    await setQuantity(entry.id, quantity);
  };

  const handleRemove = async () => {
    if (!entry) {
      return;
    }

    await removeCard(entry.id);
    router.back();
  };

  return (
    <AppBackground>
      <SafeAreaView className="flex-1" edges={['top']}>
        {!entry ? (
          <View className="flex-1 justify-center px-5">
            <EmptyState
              icon="cards-outline"
              title="Card not found"
              description="This collection entry no longer exists locally."
              actionLabel="Back to collection"
              onAction={() => router.replace('/(tabs)/collection')}
            />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-4 px-5 pb-24 pt-4">
              <CardPrintModal
                imageUrl={entry.imageUrl ?? entry.smallImageUrl}
                title={entry.name}
                visible={isPrintPreviewVisible}
                onClose={() => setIsPrintPreviewVisible(false)}
              />
              <Surface className="gap-5">
                <View className="items-center">
                  <CardPrint
                    imageUrl={entry.imageUrl ?? entry.smallImageUrl}
                    className="w-full max-w-[320px]"
                    onPress={() => setIsPrintPreviewVisible(true)}
                  />
                </View>
                <View className="gap-2">
                  <Text className="font-display text-[42px] leading-9 tracking-tightest text-obsidian dark:text-parchment">
                    {entry.name}
                  </Text>
                  <Text className="font-body text-2xl leading-5 text-slate dark:text-fog">
                    {entry.setName} • #{entry.collectorNumber ?? 'n/a'}
                  </Text>
                  <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                    Exact printing shown above. Tap the card to enlarge it.
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    <TokenChip label={entry.finish} active />
                    <TokenChip label={entry.rarity} active tone="accent" />
                    {entry.colors.map((color) => (
                      <TokenChip key={color} label={color} />
                    ))}
                  </View>
                </View>
              </Surface>

              <View className="flex-row gap-3">
                <Surface className="flex-1 gap-2">
                  <Text className="font-body text-lg uppercase tracking-[1.2px] text-slate dark:text-fog">Price</Text>
                  <Text className="font-display text-[30px] leading-7 text-obsidian dark:text-parchment">
                    {formatCurrency(entry.price)}
                  </Text>
                </Surface>
                <Surface className="flex-1 gap-2">
                  <Text className="font-body text-lg uppercase tracking-[1.2px] text-slate dark:text-fog">Owned value</Text>
                  <Text className="font-display text-[30px] leading-7 text-obsidian dark:text-parchment">
                    {formatCurrency(entry.totalValue)}
                  </Text>
                </Surface>
              </View>

              <Surface className="gap-4">
                <Text className="font-display text-[30px] leading-7 text-obsidian dark:text-parchment">
                  Quantity
                </Text>
                <View className="flex-row items-center justify-between gap-4">
                  <Text className="font-body text-2xl leading-5 text-slate dark:text-fog">
                    Add or remove copies quickly.
                  </Text>
                  <QuantityStepper
                    quantity={entry.quantity}
                    onDecrease={() => void incrementQuantity(entry.id, -1)}
                    onIncrease={() => void incrementQuantity(entry.id, 1)}
                  />
                </View>
                <View className="flex-row gap-3">
                  <TextInput
                    value={manualQuantity}
                    onChangeText={setManualQuantity}
                    keyboardType="number-pad"
                    className="flex-1 rounded-[20px] border border-sand bg-white/80 px-4 py-3 font-body text-2xl text-obsidian dark:border-ink dark:bg-night/60 dark:text-parchment"
                  />
                  <Pressable className="rounded-full bg-obsidian px-5 py-3 dark:bg-parchment" onPress={() => void handleSaveQuantity()}>
                    <Text className="font-body text-xl uppercase tracking-[1.4px] text-parchment dark:text-night">Save</Text>
                  </Pressable>
                </View>
                <Pressable className="rounded-full border border-danger/30 bg-danger/10 px-4 py-3" onPress={() => void handleRemove()}>
                  <Text className="text-center font-body text-xl uppercase tracking-[1.4px] text-danger">
                    Remove from collection
                  </Text>
                </Pressable>
              </Surface>

              <Surface className="gap-3">
                <Text className="font-display text-[30px] leading-7 text-obsidian dark:text-parchment">
                  Card text
                </Text>
                <Text className="font-body text-2xl leading-5 text-slate dark:text-fog">
                  {entry.manaCost || 'No mana cost'} • {entry.typeLine || 'Unknown type'}
                </Text>
                {oracleTextSections.length ? (
                  oracleTextSections.map((section) => (
                    <Text key={section} className="font-body text-2xl leading-6 text-obsidian dark:text-parchment">
                      {section}
                    </Text>
                  ))
                ) : (
                  <Text className="font-body text-2xl leading-6 text-obsidian dark:text-parchment">
                    No oracle text cached for this card.
                  </Text>
                )}
              </Surface>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </AppBackground>
  );
}
