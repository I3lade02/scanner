import type { ScryfallCard } from '@/src/types/scryfall';

export type CardFinish = 'nonfoil' | 'foil';
export type CollectionSortKey = 'name' | 'price' | 'quantity' | 'totalValue';
export type CollectionLayout = 'list' | 'grid';

export interface CollectionEntry {
  id: string;
  scryfallId: string;
  oracleId?: string;
  name: string;
  setCode: string;
  setName: string;
  collectorNumber?: string;
  imageUrl?: string;
  smallImageUrl?: string;
  rarity: string;
  finish: CardFinish;
  quantity: number;
  price: number;
  currency: 'USD';
  totalValue: number;
  manaCost?: string;
  typeLine?: string;
  oracleText?: string;
  colors: string[];
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
  rawCard?: ScryfallCard;
}

export interface CollectionSummary {
  uniqueCards: number;
  totalCards: number;
  totalValue: number;
}

export interface CollectionFilters {
  rarity?: string;
  color?: string;
  setCode?: string;
}

export interface AppSettings {
  autoRefreshOnLaunch: boolean;
  defaultFinish: CardFinish;
  collectionLayout: CollectionLayout;
  lastPriceRefreshAt: string | null;
}

export interface ScanMatchResult {
  candidateName?: string;
  textLines: string[];
  croppedUri?: string;
  matches: ScryfallCard[];
}

export interface ExportPayload {
  exportedAt: string;
  entries: CollectionEntry[];
  settings: AppSettings;
}
