import type { ReactNode } from 'react';
import { View, Text } from 'react-native';

import { cn } from '@/src/utils/cn';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  titleClassName?: string;
};

export function SectionHeader({ action, eyebrow, subtitle, title, titleClassName }: SectionHeaderProps) {
  return (
    <View className="flex-row items-end justify-between gap-4">
      <View className="flex-1">
        {eyebrow ? (
          <Text className="font-body text-sm uppercase tracking-[2px] text-slate dark:text-fog">
            {eyebrow}
          </Text>
        ) : null}
        <Text className={cn('font-display text-[34px] leading-[34px] tracking-tightest text-obsidian dark:text-parchment', titleClassName)}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-2 font-body text-xl leading-5 text-slate dark:text-fog">{subtitle}</Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}
