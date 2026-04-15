import { extractCandidateNames } from '@/src/features/scan/ocr-helpers';
import type { ScanMatchResult } from '@/src/types/collection';
import type { ScryfallAutocompleteResponse, ScryfallCard, ScryfallSearchResponse } from '@/src/types/scryfall';

const SCRYFALL_BASE_URL = 'https://api.scryfall.com';

export class ScryfallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScryfallError';
  }
}

async function fetchScryfall<T>(path: string): Promise<T> {
  const response = await fetch(`${SCRYFALL_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json;q=0.9,*/*;q=0.8',
      'User-Agent': 'ManaVault/1.0 (Expo React Native)',
    },
  });

  if (!response.ok) {
    let message = 'Unable to reach Scryfall right now.';

    try {
      const payload = (await response.json()) as { details?: string };
      if (payload.details) {
        message = payload.details;
      }
    } catch {
      // Ignore invalid payloads and fall back to the default message.
    }

    throw new ScryfallError(message);
  }

  return (await response.json()) as T;
}

export async function searchCards(query: string) {
  if (!query.trim()) {
    return [] as ScryfallCard[];
  }

  const payload = await fetchScryfall<ScryfallSearchResponse>(
    `/cards/search?order=released&dir=desc&include_extras=false&include_variations=true&unique=prints&q=${encodeURIComponent(
      `${query} game:paper`
    )}`
  );

  return payload.data;
}

export async function getAutocompleteSuggestions(query: string) {
  if (query.trim().length < 2) {
    return [] as string[];
  }

  const payload = await fetchScryfall<ScryfallAutocompleteResponse>(
    `/cards/autocomplete?q=${encodeURIComponent(query)}`
  );

  return payload.data.slice(0, 8);
}

export async function getCardById(cardId: string) {
  return fetchScryfall<ScryfallCard>(`/cards/${cardId}`);
}

export async function getFuzzyNamedCard(name: string) {
  return fetchScryfall<ScryfallCard>(`/cards/named?fuzzy=${encodeURIComponent(name)}`);
}

export async function searchPrintingsByName(name: string) {
  return fetchScryfall<ScryfallSearchResponse>(
    `/cards/search?order=released&dir=desc&unique=prints&q=${encodeURIComponent(`!"${name}" game:paper`)}`
  ).then((payload) => payload.data);
}

export async function findCardMatchesFromText(textLines: string[], croppedUri?: string): Promise<ScanMatchResult> {
  const candidates = extractCandidateNames(textLines);

  for (const candidate of candidates) {
    try {
      const card = await getFuzzyNamedCard(candidate);
      const matches = await searchPrintingsByName(card.name);

      return {
        candidateName: card.name,
        textLines,
        croppedUri,
        matches: matches.slice(0, 12),
      };
    } catch {
      // Ignore individual OCR candidate failures and try the next line.
    }
  }

  return {
    candidateName: candidates[0],
    textLines,
    croppedUri,
    matches: [],
  };
}
