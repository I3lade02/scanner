import { Pressable, Text, View } from 'react-native';

import { cn } from '@/src/utils/cn';

type TokenChipProps = {
  label: string;
  active?: boolean;
  tone?: 'default' | 'accent' | 'ghost';
  onPress?: () => void;
};

export function TokenChip({ active, label, onPress, tone = 'default' }: TokenChipProps) {
  const className = cn(
    'rounded-full border px-4 py-2',
    tone === 'accent' && active && 'border-ember bg-ember/15 dark:bg-ember/20',
    tone === 'ghost' && 'border-sand/70 bg-white/50 dark:border-ink dark:bg-night/50',
    tone === 'default' && !active && 'border-sand/70 bg-white/70 dark:border-ink dark:bg-night/50',
    tone === 'default' && active && 'border-moss bg-moss/15 dark:bg-moss/20'
  );

  if (!onPress) {
    return (
      <View className={className}>
        <Text className="font-body text-lg uppercase tracking-[1.2px] text-obsidian dark:text-parchment">
          {label}
        </Text>
      </View>
    );
  }

  return (
    <Pressable className={className} onPress={onPress}>
      <Text className="font-body text-lg uppercase tracking-[1.2px] text-obsidian dark:text-parchment">
        {label}
      </Text>
    </Pressable>
  );
}
