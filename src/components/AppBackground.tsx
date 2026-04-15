import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

export function AppBackground({ children }: PropsWithChildren) {
  return (
    <View className="flex-1 bg-parchment dark:bg-night">
      <View className="absolute inset-0 bg-parchment dark:bg-night" />
      <View className="absolute inset-0 bg-[#efe4d1] opacity-60 dark:bg-[#171c15]" />
      <View className="absolute -right-10 top-6 h-40 w-40 rounded-full bg-ember/15 dark:bg-ember/20" />
      <View className="absolute -left-8 top-48 h-52 w-52 rounded-full bg-moss/10 dark:bg-moss/20" />
      <View className="absolute bottom-8 right-8 h-28 w-28 rounded-full bg-brass/15 dark:bg-brass/20" />
      {children}
    </View>
  );
}
