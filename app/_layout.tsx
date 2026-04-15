import '@/src/styles/global.css';

import {
  DarkerGrotesque_500Medium,
  DarkerGrotesque_700Bold,
  DarkerGrotesque_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/darker-grotesque';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getNavigationTheme, palette } from '@/src/constants/palette';
import { useCollectionStore } from '@/src/store/collection-store';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const scheme = systemScheme === 'dark' ? 'dark' : 'light';
  const [fontsLoaded] = useFonts({
    DarkerGrotesque_500Medium,
    DarkerGrotesque_700Bold,
    DarkerGrotesque_800ExtraBold,
  });
  const hydrate = useCollectionStore((state) => state.hydrate);
  const isHydrated = useCollectionStore((state) => state.isHydrated);
  const settings = useCollectionStore((state) => state.settings);
  const collection = useCollectionStore((state) => state.collection);
  const refreshPrices = useCollectionStore((state) => state.refreshPrices);
  const didAutoRefresh = useRef(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    // Keep the root effect so theme changes still trigger a render boundary.
  }, [scheme]);

  useEffect(() => {
    if (!fontsLoaded || !isHydrated) {
      return;
    }

    void SplashScreen.hideAsync();
  }, [fontsLoaded, isHydrated]);

  useEffect(() => {
    if (!isHydrated || !settings?.autoRefreshOnLaunch || !collection.length || didAutoRefresh.current) {
      return;
    }

    didAutoRefresh.current = true;
    void refreshPrices({ silent: true });
  }, [collection.length, isHydrated, refreshPrices, settings?.autoRefreshOnLaunch]);

  if (!fontsLoaded || !isHydrated) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={getNavigationTheme(scheme)}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' },
            headerStyle: {
              backgroundColor: palette[scheme].surface,
            },
            headerTintColor: palette[scheme].text,
            headerTitleStyle: {
              fontFamily: 'DarkerGrotesque_700Bold',
              fontSize: 24,
            },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="card/[id]" options={{ title: 'Card Detail' }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
