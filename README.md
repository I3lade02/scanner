# Mana Vault

Android-first Expo app for managing a personal Magic: The Gathering collection.

## Stack

- Expo SDK 55
- React Native 0.83
- TypeScript
- Expo Router
- NativeWind v4
- Zustand
- AsyncStorage
- Scryfall API
- Expo Camera + `expo-text-extractor` OCR

## MVP Features

- Local collection storage with AsyncStorage
- Scryfall search with debounce and autocomplete
- Multiple-printing selection before add
- Foil vs non-foil tracking
- Quantity management and manual quantity editing
- Card detail screen with image, oracle text, mana cost, type line, set info, and price
- Collection value summary and per-card totals
- Camera scan flow with OCR match confirmation
- Manual price refresh and optional refresh on app launch
- JSON export of the local collection
- Offline collection viewing from persisted data

## Project Structure

```text
app/
  _layout.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    collection.tsx
    search.tsx
    scan.tsx
    settings.tsx
  card/
    [id].tsx
src/
  components/
    AppBackground.tsx
    CollectionCard.tsx
    EmptyState.tsx
    ErrorBanner.tsx
    LoadingState.tsx
    QuantityStepper.tsx
    SearchResultCard.tsx
    SectionHeader.tsx
    StatCard.tsx
    Surface.tsx
    TokenChip.tsx
  constants/
    palette.ts
  features/
    collection/
      selectors.ts
    scan/
      ocr-helpers.ts
  services/
    collection-repository.ts
    export-service.ts
    ocr-service.ts
    scryfall-service.ts
  store/
    collection-store.ts
  styles/
    global.css
  types/
    collection.ts
    scryfall.ts
  utils/
    card-mappers.ts
    cn.ts
    currency.ts
    date.ts
    debounce.ts
```

## Setup

1. Install dependencies.

```bash
npm install
```

2. Start the standard Expo development server.

```bash
npm run start
```

3. Run on Android with Expo.

```bash
npm run android
```

4. For camera OCR, build a development client. `expo-text-extractor` is a native module, so scan-to-add is not available in plain Expo Go.

```bash
npm run android:dev
npm run start:dev
```

## EAS

EAS CLI is installed locally in this project and configured through `eas.json`.

Useful commands:

```bash
npm run eas:login
npm run eas:whoami
npm run eas:build:android:development
npm run eas:build:android:preview
npm run eas:build:android:production
```

Build profiles:

- `development`: internal development build with `expo-dev-client`
- `preview`: internal Android APK for device testing and sharing
- `production`: Android App Bundle for Play Store release

## Validation

```bash
npm run typecheck
npm run lint
```

## API Notes

- Card data, autocomplete, and prices come from Scryfall.
- Prices use Scryfall USD and USD foil snapshots.
- OCR reads the captured image, extracts likely title lines, then confirms matches against Scryfall printings.

## Implementation Roadmap

Completed in this MVP:

- App shell, theming, and Android-first tab navigation
- AsyncStorage persistence and Zustand store
- Dashboard, Collection, Search, Scan, Detail, and Settings screens
- Scryfall integration for search, autocomplete, and pricing
- OCR-backed scan confirmation flow

Good next steps:

- Cardmarket pricing integration
- Import from JSON
- Wishlist support
- Price history snapshots
- Bulk editing and tags
- Better Android app icons and splash artwork
