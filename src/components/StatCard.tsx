import { View, Text } from 'react-native';
import type { ReactNode } from 'react';

import { Surface } from '@/src/components/Surface';

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
};

export function StatCard({ hint, icon, label, value }: StatCardProps) {
  return (
    <Surface className="flex-1 gap-3 p-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-body text-lg uppercase tracking-[1.5px] text-slate dark:text-fog">{label}</Text>
        {icon}
      </View>
      <Text className="font-display text-[32px] leading-8 text-obsidian dark:text-parchment">{value}</Text>
      {hint ? <Text className="font-body text-lg text-slate dark:text-fog">{hint}</Text> : null}
    </Surface>
  );
}
