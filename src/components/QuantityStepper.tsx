import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type QuantityStepperProps = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function QuantityStepper({ onDecrease, onIncrease, quantity }: QuantityStepperProps) {
  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        className="h-9 w-9 items-center justify-center rounded-full border border-sand bg-white dark:border-ink dark:bg-night"
        onPress={onDecrease}>
        <MaterialCommunityIcons name="minus" size={18} color="#20261f" />
      </Pressable>
      <Text className="min-w-8 text-center font-display text-[24px] leading-6 text-obsidian dark:text-parchment">
        {quantity}
      </Text>
      <Pressable
        className="h-9 w-9 items-center justify-center rounded-full border border-ember bg-ember/10 dark:bg-ember/20"
        onPress={onIncrease}>
        <MaterialCommunityIcons name="plus" size={18} color="#dc6a40" />
      </Pressable>
    </View>
  );
}
