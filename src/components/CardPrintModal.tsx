import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CardPrintModalProps = {
  imageUrl?: string;
  title: string;
  visible: boolean;
  onClose: () => void;
};

export function CardPrintModal({ imageUrl, onClose, title, visible }: CardPrintModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-black/90">
        <View className="flex-1 px-5 py-4">
          <View className="mb-4 flex-row items-center justify-between gap-4">
            <Text className="flex-1 font-display text-[32px] leading-8 text-parchment">{title}</Text>
            <Pressable
              className="h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10"
              onPress={onClose}>
              <MaterialCommunityIcons name="close" size={22} color="#fbfaf6" />
            </Pressable>
          </View>
          <View className="flex-1 items-center justify-center">
            {imageUrl ? (
              <Image
                source={imageUrl}
                contentFit="contain"
                transition={200}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <View className="items-center justify-center rounded-[28px] border border-white/10 bg-white/5 px-8 py-10">
                <Text className="text-center font-body text-2xl text-parchment">
                  No print image is available for this card.
                </Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
