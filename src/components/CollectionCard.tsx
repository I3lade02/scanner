import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { CardPrint } from '@/src/components/CardPrint';
import { QuantityStepper } from '@/src/components/QuantityStepper';
import { Surface } from '@/src/components/Surface';
import type { CollectionEntry } from '@/src/types/collection';
import { formatCurrency } from '@/src/utils/currency';

type CollectionCardProps = {
  entry: CollectionEntry;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
};

export function CollectionCard({ entry, onDecrease, onIncrease, onRemove }: CollectionCardProps) {
  return (
    <Surface className="gap-4 p-4">
      <View className="flex-row gap-4">
        <Link href={{ pathname: '/card/[id]', params: { id: entry.id } }} asChild>
          <Pressable className="flex-1 flex-row gap-4">
            <CardPrint imageUrl={entry.imageUrl ?? entry.smallImageUrl} className="w-32 shrink-0" />
            <View className="flex-1 gap-1">
              <Text className="font-display text-[30px] leading-8 text-obsidian dark:text-parchment">
                {entry.name}
              </Text>
              <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                {entry.setName} • #{entry.collectorNumber ?? 'n/a'}
              </Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                <View className="rounded-full bg-moss/12 px-3 py-1 dark:bg-moss/20">
                  <Text className="font-body text-lg uppercase tracking-[1px] text-obsidian dark:text-parchment">
                    {entry.finish}
                  </Text>
                </View>
                <View className="rounded-full bg-brass/12 px-3 py-1 dark:bg-brass/20">
                  <Text className="font-body text-lg uppercase tracking-[1px] text-obsidian dark:text-parchment">
                    {entry.rarity}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Link>
        <Pressable className="self-start rounded-full bg-danger/10 p-2" onPress={onRemove}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#b14b4b" />
        </Pressable>
      </View>

      <View className="flex-row items-center justify-between gap-4">
        <View>
          <Text className="font-body text-lg uppercase tracking-[1px] text-slate dark:text-fog">Value</Text>
          <Text className="font-display text-[28px] leading-7 text-obsidian dark:text-parchment">
            {formatCurrency(entry.totalValue)}
          </Text>
          <Text className="font-body text-lg text-slate dark:text-fog">
            {formatCurrency(entry.price)} each
          </Text>
        </View>
        <QuantityStepper quantity={entry.quantity} onDecrease={onDecrease} onIncrease={onIncrease} />
      </View>
    </Surface>
  );
}
