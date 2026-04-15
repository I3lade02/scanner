import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';

import { Surface } from '@/src/components/Surface';

type ErrorBannerProps = {
  message: string;
  onDismiss?: () => void;
};

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <Surface className="flex-row items-center gap-3 border-danger/25 bg-danger/10 py-4">
      <MaterialCommunityIcons name="alert-circle-outline" size={22} color="#b14b4b" />
      <Text className="flex-1 font-body text-xl leading-5 text-obsidian dark:text-parchment">{message}</Text>
      {onDismiss ? (
        <Pressable onPress={onDismiss}>
          <Text className="font-semibold text-base uppercase tracking-[1px] text-danger">Close</Text>
        </Pressable>
      ) : null}
    </Surface>
  );
}
