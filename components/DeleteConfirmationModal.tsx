import { Text, View, Pressable, Modal } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
}

export function DeleteConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message,
}: DeleteConfirmationModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="mx-4 w-[90%] rounded-2xl bg-white p-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
              {title}
            </Text>
            <Pressable onPress={onClose}>
              <Octicons name="x" size={20} color={COLORS.gray[400]} />
            </Pressable>
          </View>

          <Text className="mb-6" style={{ color: COLORS.gray[600] }}>
            {message}
          </Text>

          <View className="flex-row space-x-3">
            <Pressable
              onPress={onClose}
              className="mx-1 flex-1 rounded-xl border p-3"
              style={{ borderColor: COLORS.gray[200] }}>
              <Text className="text-center font-semibold" style={{ color: COLORS.gray[600] }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className="mx-1 flex-1 rounded-xl p-3"
              style={{ backgroundColor: COLORS.error }}>
              <Text className="text-center font-semibold text-white">Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
