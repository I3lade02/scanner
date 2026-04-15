import { useLocalSearchParams } from 'expo-router';
import { startTransition, useEffect, useState } from 'react';
import { Alert, FlatList, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground } from '@/src/components/AppBackground';
import { EmptyState } from '@/src/components/EmptyState';
import { ErrorBanner } from '@/src/components/ErrorBanner';
import { LoadingState } from '@/src/components/LoadingState';
import { SearchResultCard } from '@/src/components/SearchResultCard';
import { SectionHeader } from '@/src/components/SectionHeader';
import { Surface } from '@/src/components/Surface';
import { TokenChip } from '@/src/components/TokenChip';
import { getAutocompleteSuggestions, searchCards } from '@/src/services/scryfall-service';
import { useCollectionStore } from '@/src/store/collection-store';
import type { CardFinish } from '@/src/types/collection';
import type { ScryfallCard } from '@/src/types/scryfall';
import { useDebouncedValue } from '@/src/utils/debounce';

const EXAMPLE_QUERIES = ['Lightning Bolt', 'Sol Ring', 'Atraxa', 'Island'];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ query?: string }>();
  const defaultFinish = useCollectionStore((state) => state.settings?.defaultFinish ?? 'nonfoil');
  const addCard = useCollectionStore((state) => state.addCard);
  const [query, setQuery] = useState(typeof params.query === 'string' ? params.query : '');
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedFinish, setSelectedFinish] = useState<Record<string, CardFinish>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query, 350);

  useEffect(() => {
    if (typeof params.query === 'string' && params.query && params.query !== query) {
      setQuery(params.query);
    }
  }, [params.query, query]);

  useEffect(() => {
    let isCancelled = false;

    async function runSearch() {
      if (debouncedQuery.trim().length < 2) {
        setSuggestions([]);
        setResults([]);
        setErrorMessage(null);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [nextSuggestions, nextResults] = await Promise.all([
          getAutocompleteSuggestions(debouncedQuery),
          debouncedQuery.trim().length >= 3 ? searchCards(debouncedQuery) : Promise.resolve([]),
        ]);

        if (isCancelled) {
          return;
        }

        startTransition(() => {
          setSuggestions(nextSuggestions);
          setResults(nextResults.slice(0, 24));
        });
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to search cards right now.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void runSearch();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

  const handleAddCard = async (card: ScryfallCard) => {
    const finish = selectedFinish[card.id] ?? defaultFinish;

    try {
      await addCard(card, { finish, quantity: 1 });
      Alert.alert('Added to collection', `${card.name} was added as ${finish}.`);
    } catch (error) {
      Alert.alert('Add failed', error instanceof Error ? error.message : 'Unable to add this card.');
    }
  };

  return (
    <AppBackground>
      <SafeAreaView className="flex-1" edges={['top']}>
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 20, paddingTop: 16, gap: 16 }}
          ListHeaderComponent={
            <View className="gap-4 pb-4">
              <SectionHeader
                eyebrow="Search"
                title="Find any printing"
                subtitle="Search Scryfall in real time, compare printings, then choose the exact version you own."
              />

              {errorMessage ? <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} /> : null}

              <Surface className="gap-3 p-4">
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search by name, set, oracle text..."
                  placeholderTextColor="#7e877f"
                  autoCorrect={false}
                  autoCapitalize="words"
                  className="rounded-[22px] border border-sand bg-white/80 px-4 py-3 font-body text-2xl text-obsidian dark:border-ink dark:bg-night/60 dark:text-parchment"
                />
                <View className="flex-row flex-wrap gap-2">
                  {(suggestions.length ? suggestions : EXAMPLE_QUERIES).map((suggestion) => (
                    <TokenChip
                      key={suggestion}
                      label={suggestion}
                      onPress={() => setQuery(suggestion)}
                      tone="ghost"
                    />
                  ))}
                </View>
              </Surface>

              {isLoading ? <LoadingState label="Searching Scryfall printings..." /> : null}
            </View>
          }
          ListEmptyComponent={
            debouncedQuery.trim().length >= 3 && !isLoading ? (
              <EmptyState
                icon="magnify-close"
                title="No cards found"
                description="Try a shorter name, an autocomplete suggestion, or search by set and card name together."
              />
            ) : (
              <EmptyState
                icon="star-four-points-outline"
                title="Search the multiverse"
                description="Use autocomplete suggestions or tap one of the example searches to get started."
              />
            )
          }
          renderItem={({ item }) => (
            <View className="mb-3">
              <SearchResultCard
                card={item}
                selectedFinish={selectedFinish[item.id] ?? defaultFinish}
                onSelectFinish={(finish) =>
                  setSelectedFinish((current) => ({
                    ...current,
                    [item.id]: finish,
                  }))
                }
                onAdd={() => void handleAddCard(item)}
              />
            </View>
          )}
        />
      </SafeAreaView>
    </AppBackground>
  );
}
