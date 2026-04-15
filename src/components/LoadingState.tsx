import { ActivityIndicator, Text, View } from 'react-native';

import { Surface } from '@/src/components/Surface';

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading your collection...' }: LoadingStateProps) {
  return (
    <Surface className="flex-row items-center gap-4 py-4">
      <ActivityIndicator color="#dc6a40" />
      <View className="flex-1">
        <Text className="font-body text-xl leading-5 text-obsidian dark:text-parchment">{label}</Text>
      </View>
    </Surface>
  );
}
