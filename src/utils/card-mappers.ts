import type { CardFinish, CollectionEntry } from '@/src/types/collection';
import type { ScryfallCard } from '@/src/types/scryfall';

function parsePrice(price: string | null | undefined): number {
  const nextValue = Number.parseFloat(price ?? '');
  return Number.isFinite(nextValue) ? nextValue : 0;
}

export function getCardImages(card: ScryfallCard) {
  const imageUris = card.image_uris ?? card.card_faces?.find((face) => face.image_uris)?.image_uris;

  return {
    imageUrl: imageUris?.normal ?? imageUris?.large,
    smallImageUrl: imageUris?.small ?? imageUris?.normal,
  };
}

export function getCardColors(card: ScryfallCard): string[] {
  return card.colors ?? card.card_faces?.flatMap((face) => face.colors ?? []) ?? card.color_identity ?? [];
}

export function pickCardPrice(card: ScryfallCard, finish: CardFinish): number {
  if (finish === 'foil') {
    return parsePrice(card.prices.usd_foil ?? card.prices.usd);
  }

  return parsePrice(card.prices.usd ?? card.prices.usd_foil);
}

export function buildCollectionEntryId(card: Pick<ScryfallCard, 'id'>, finish: CardFinish) {
  return `${card.id}:${finish}`;
}

export function mapCardToCollectionEntry(
  card: ScryfallCard,
  options: {
    finish: CardFinish;
    quantity?: number;
    createdAt?: string;
    existingQuantity?: number;
  }
): CollectionEntry {
  const quantity = options.quantity ?? options.existingQuantity ?? 1;
  const { imageUrl, smallImageUrl } = getCardImages(card);
  const price = pickCardPrice(card, options.finish);
  const now = new Date().toISOString();

  return {
    id: buildCollectionEntryId(card, options.finish),
    scryfallId: card.id,
    oracleId: card.oracle_id,
    name: card.name,
    setCode: card.set.toUpperCase(),
    setName: card.set_name,
    collectorNumber: card.collector_number,
    imageUrl,
    smallImageUrl,
    rarity: card.rarity,
    finish: options.finish,
    quantity,
    price,
    currency: 'USD',
    totalValue: quantity * price,
    manaCost: card.mana_cost ?? card.card_faces?.[0]?.mana_cost,
    typeLine: card.type_line ?? card.card_faces?.[0]?.type_line,
    oracleText: card.oracle_text ?? card.card_faces?.map((face) => face.oracle_text).filter(Boolean).join('\n\n'),
    colors: getCardColors(card),
    releasedAt: card.released_at,
    createdAt: options.createdAt ?? now,
    updatedAt: now,
    rawCard: card,
  };
}

export function withAdjustedQuantity(entry: CollectionEntry, quantity: number): CollectionEntry {
  return {
    ...entry,
    quantity,
    totalValue: entry.price * quantity,
    updatedAt: new Date().toISOString(),
  };
}
