import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { cn } from '@/src/utils/cn';

type CardPrintProps = {
  imageUrl?: string;
  className?: string;
  imageClassName?: string;
  onPress?: () => void;
};

export function CardPrint({ className, imageClassName, imageUrl, onPress }: CardPrintProps) {
  const content = (
    <View
      className={cn(
        'overflow-hidden rounded-[24px] border border-sand/70 bg-white/70 shadow-card dark:border-ink dark:bg-night/70',
        className
      )}
      style={{ aspectRatio: 5 / 7 }}>
      {imageUrl ? (
        <View className={cn('h-full w-full bg-sand/40 dark:bg-night', imageClassName)}>
          <Image
            source={{ uri: imageUrl }}
            contentFit="contain"
            transition={200}
            style={{ width: '100%', height: '100%' }}
          />
        </View>
      ) : (
        <View className="h-full w-full items-center justify-center bg-sand/70 px-4 dark:bg-night">
          <Text className="text-center font-body text-xl leading-5 text-slate dark:text-fog">
            Card image unavailable
          </Text>
        </View>
      )}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}
