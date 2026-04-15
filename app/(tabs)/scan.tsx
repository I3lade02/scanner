import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground } from '@/src/components/AppBackground';
import { EmptyState } from '@/src/components/EmptyState';
import { ErrorBanner } from '@/src/components/ErrorBanner';
import { LoadingState } from '@/src/components/LoadingState';
import { SearchResultCard } from '@/src/components/SearchResultCard';
import { SectionHeader } from '@/src/components/SectionHeader';
import { Surface } from '@/src/components/Surface';
import { findCardMatchesFromText } from '@/src/services/scryfall-service';
import { getOcrSupport, readCardTextFromPicture } from '@/src/services/ocr-service';
import { useCollectionStore } from '@/src/store/collection-store';
import type { CardFinish, ScanMatchResult } from '@/src/types/collection';

type OcrStatus = 'checking' | 'ready' | 'unavailable';

export default function ScanScreen() {
  const router = useRouter();
  const defaultFinish = useCollectionStore((state) => state.settings?.defaultFinish ?? 'nonfoil');
  const addCard = useCollectionStore((state) => state.addCard);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>('checking');
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanMatchResult | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<Record<string, CardFinish>>({});

  useEffect(() => {
    let active = true;

    void getOcrSupport().then((supported) => {
      if (active) {
        setOcrStatus(supported ? 'ready' : 'unavailable');
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || isBusy) {
      return;
    }

    setIsBusy(true);
    setErrorMessage(null);

    try {
      const picture = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });

      const { croppedUri, textLines } = await readCardTextFromPicture(picture);

      if (!textLines.length) {
        throw new Error('No readable card text was detected. Try better lighting or use manual search.');
      }

      const nextResult = await findCardMatchesFromText(textLines, croppedUri);
      setScanResult(nextResult);

      if (!nextResult.matches.length) {
        setErrorMessage('OCR ran, but no Scryfall card name matched. You can jump to manual search instead.');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Scan failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleAddCard = async (cardId: string) => {
    const card = scanResult?.matches.find((match) => match.id === cardId);
    if (!card) {
      return;
    }

    const finish = selectedFinish[card.id] ?? defaultFinish;

    try {
      await addCard(card, { finish, quantity: 1 });
      Alert.alert('Card added', `${card.name} was added to your collection.`);
    } catch (error) {
      Alert.alert('Add failed', error instanceof Error ? error.message : 'Unable to add this card.');
    }
  };

  const manualQuery = scanResult?.candidateName ?? scanResult?.textLines[0] ?? '';

  return (
    <AppBackground>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="gap-4 px-5 pb-32 pt-4">
            <SectionHeader
              eyebrow="Scan"
              title="Camera capture"
              subtitle="Frame the card inside the guide, let OCR detect the title, then confirm the printing before adding it."
            />

            {!permission ? <LoadingState label="Checking camera permission..." /> : null}

            {permission && !permission.granted ? (
              <EmptyState
                icon="camera-lock-outline"
                title="Camera access needed"
                description="Grant camera permission to scan physical cards with the overlay guide."
                actionLabel="Allow camera"
                onAction={() => void requestPermission()}
              />
            ) : null}

            {permission?.granted && ocrStatus === 'checking' ? (
              <LoadingState label="Checking OCR availability..." />
            ) : null}

            {permission?.granted && ocrStatus === 'unavailable' ? (
              <EmptyState
                icon="robot-confused-outline"
                title="OCR unavailable in this client"
                description="Scanning needs a development build or standalone app with the OCR native module. Manual search still works right now."
                actionLabel="Open search"
                onAction={() => router.push('/(tabs)/search')}
              />
            ) : null}

            {permission?.granted && ocrStatus === 'ready' ? (
              <Surface className="gap-4 p-4">
                <View className="overflow-hidden rounded-[28px]">
                  <View className="relative">
                    <CameraView ref={cameraRef} facing="back" className="h-[420px] w-full" />
                    <View className="pointer-events-none absolute inset-0 items-center justify-center px-6">
                      <View className="h-[300px] w-full max-w-[240px] rounded-[30px] border-2 border-dashed border-white/90 bg-black/10" />
                      <View className="absolute bottom-6 rounded-full bg-black/50 px-4 py-2">
                        <Text className="font-body text-xl uppercase tracking-[1.2px] text-parchment">
                          Align the card title near the top edge
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View className="flex-row gap-3">
                  <Pressable
                    className="flex-1 rounded-full bg-obsidian px-4 py-4 dark:bg-parchment"
                    disabled={isBusy}
                    onPress={() => void handleCapture()}>
                    <Text className="text-center font-body text-xl uppercase tracking-[1.4px] text-parchment dark:text-night">
                      {isBusy ? 'Scanning…' : 'Capture card'}
                    </Text>
                  </Pressable>
                  <Pressable
                    className="rounded-full border border-sand bg-white/70 px-4 py-4 dark:border-ink dark:bg-night/50"
                    onPress={() => {
                      setScanResult(null);
                      setErrorMessage(null);
                    }}>
                    <MaterialCommunityIcons name="refresh" size={22} color="#dc6a40" />
                  </Pressable>
                </View>
              </Surface>
            ) : null}

            {errorMessage ? <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} /> : null}

            {isBusy ? <LoadingState label="Reading card text and checking Scryfall matches..." /> : null}

            {scanResult ? (
              <>
                <SectionHeader
                  title={scanResult.candidateName ? `Matches for ${scanResult.candidateName}` : 'Best matches'}
                  subtitle="Confirm the printing below or jump to manual search if OCR missed the card."
                />
                {scanResult.croppedUri ? (
                  <Surface className="gap-3 p-4">
                    <Text className="font-body text-lg uppercase tracking-[1.4px] text-slate dark:text-fog">
                      OCR crop preview
                    </Text>
                    <Image
                      source={scanResult.croppedUri}
                      contentFit="contain"
                      transition={200}
                      className="h-40 w-full rounded-[22px] bg-sand dark:bg-night"
                    />
                    <Text className="font-body text-xl leading-5 text-slate dark:text-fog">
                      Detected lines: {scanResult.textLines.join(' • ')}
                    </Text>
                  </Surface>
                ) : null}

                {scanResult.matches.length ? (
                  <View className="gap-3">
                    {scanResult.matches.map((card) => (
                      <SearchResultCard
                        key={card.id}
                        card={card}
                        selectedFinish={selectedFinish[card.id] ?? defaultFinish}
                        onSelectFinish={(finish) =>
                          setSelectedFinish((current) => ({
                            ...current,
                            [card.id]: finish,
                          }))
                        }
                        onAdd={() => void handleAddCard(card.id)}
                      />
                    ))}
                  </View>
                ) : (
                  <EmptyState
                    icon="cards-outline"
                    title="No confident match"
                    description="The scan finished, but none of the detected lines matched a Scryfall card. Manual search is still available."
                  />
                )}

                <Pressable
                  className="rounded-full border border-sand bg-white/70 px-4 py-4 dark:border-ink dark:bg-night/50"
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/search',
                      params: manualQuery ? { query: manualQuery } : undefined,
                    })
                  }>
                  <Text className="text-center font-body text-xl uppercase tracking-[1.4px] text-obsidian dark:text-parchment">
                    Fall back to manual search
                  </Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}
