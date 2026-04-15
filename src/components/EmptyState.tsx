import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Surface } from '@/src/components/Surface';

type EmptyStateProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ actionLabel, description, icon, onAction, title }: EmptyStateProps) {
  return (
    <Surface className="items-center gap-4 px-6 py-8">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-ember/10 dark:bg-ember/20">
        <MaterialCommunityIcons name={icon} size={28} color="#dc6a40" />
      </View>
      <View className="gap-2">
        <Text className="text-center font-display text-[28px] leading-7 text-obsidian dark:text-parchment">
          {title}
        </Text>
        <Text className="text-center font-body text-xl leading-5 text-slate dark:text-fog">
          {description}
        </Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable className="rounded-full bg-obsidian px-5 py-3 dark:bg-parchment" onPress={onAction}>
          <Text className="font-body text-xl uppercase tracking-[1.5px] text-parchment dark:text-night">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </Surface>
  );
}
