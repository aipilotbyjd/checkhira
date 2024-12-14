import { Text, View, Pressable, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
}

export function SuccessModal({
  visible,
  onClose,
  title = 'Success!',
  message,
  buttonText = 'Done',
}: SuccessModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="mx-4 w-[90%] rounded-2xl bg-white p-6">
          <View className="mb-4 items-center">
            <MaterialCommunityIcons name="check-circle" size={50} color={COLORS.success} />
          </View>

          <Text className="mb-3 text-center text-xl font-semibold" style={{ color: COLORS.secondary }}>
            {title}
          </Text>

          <Text className="mb-6 text-center" style={{ color: COLORS.gray[600] }}>
            {message}
          </Text>

          <Pressable
            onPress={onClose}
            className="rounded-xl p-3"
            style={{ backgroundColor: COLORS.success }}>
            <Text className="text-center font-semibold text-white">{buttonText}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
