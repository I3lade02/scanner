import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { cn } from '@/src/utils/cn';

type SurfaceProps = PropsWithChildren<{
  className?: string;
}>;

export function Surface({ children, className }: SurfaceProps) {
  return (
    <View
      className={cn(
        'rounded-[28px] border border-sand/80 bg-ivory px-5 py-5 shadow-card dark:border-ink dark:bg-ink',
        className
      )}>
      {children}
    </View>
  );
}
