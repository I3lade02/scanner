import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CardPrint } from '@/src/components/CardPrint';
import { CardPrintModal } from '@/src/components/CardPrintModal';
import { Surface } from '@/src/components/Surface';
import { TokenChip } from '@/src/components/TokenChip';
import type { CardFinish } from '@/src/types/collection';
import type { ScryfallCard } from '@/src/types/scryfall';
import { getCardImages, pickCardPrice } from '@/src/utils/card-mappers';
import { formatCurrency } from '@/src/utils/currency';

type SearchResultCardProps = {
  card: ScryfallCard;
  selectedFinish: CardFinish;
  onSelectFinish: (finish: CardFinish) => void;
  onAdd: () => void;
  onPreview?: () => void;
};

export function SearchResultCard({
  card,
  onAdd,
  onPreview,
  onSelectFinish,
  selectedFinish,
}: SearchResultCardProps) {
  const { imageUrl, smallImageUrl } = getCardImages(card);
  const regularPrice = pickCardPrice(card, 'nonfoil');
  const foilPrice = pickCardPrice(card, 'foil');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  return (
    <Surface className="gap-4 p-4">
      <CardPrintModal
        imageUrl={imageUrl ?? smallImageUrl}
        title={card.name}
        visible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
      />
      <View className="items-center gap-4">
        <CardPrint
          imageUrl={imageUrl ?? smallImageUrl}
          className="w-full max-w-[240px] self-center"
          onPress={() => {
            setIsPreviewVisible(true);
            onPreview?.();
          }}
        />
        <View className="w-full gap-1">
          <Text className="font-display text-[30px] leading-8 text-obsidian dark:text-parchment">{card.name}</Text>
          <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
            {card.set_name} • #{card.collector_number ?? 'n/a'}
          </Text>
          <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
            {card.rarity} • {card.type_line ?? card.card_faces?.[0]?.type_line ?? 'Card'}
          </Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            <TokenChip
              label={`Regular ${formatCurrency(regularPrice)}`}
              active={selectedFinish === 'nonfoil'}
              onPress={() => onSelectFinish('nonfoil')}
            />
            {foilPrice > 0 ? (
              <TokenChip
                label={`Foil ${formatCurrency(foilPrice)}`}
                active={selectedFinish === 'foil'}
                onPress={() => onSelectFinish('foil')}
                tone="accent"
              />
            ) : null}
          </View>
        </View>
      </View>
      <View className="flex-row gap-3">
        <Pressable
          className="flex-1 rounded-full border border-sand bg-white/80 px-4 py-3 dark:border-ink dark:bg-night/60"
          onPress={() => {
            setIsPreviewVisible(true);
            onPreview?.();
          }}>
          <Text className="text-center font-body text-xl uppercase tracking-[1.4px] text-obsidian dark:text-parchment">
            View print
          </Text>
        </Pressable>
        <Pressable className="flex-1 rounded-full bg-obsidian px-4 py-3 dark:bg-parchment" onPress={onAdd}>
          <Text className="text-center font-body text-xl uppercase tracking-[1.4px] text-parchment dark:text-night">
            Add to collection
          </Text>
        </Pressable>
      </View>
    </Surface>
  );
}
