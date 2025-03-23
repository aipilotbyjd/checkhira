import { Pressable, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/theme';
import { Payment } from '../types/payment';
import { useLanguage } from '../contexts/LanguageContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type PaymentListItemProps = {
  item: Payment;
};

export function PaymentListItem({ item }: PaymentListItemProps) {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <Pressable
      onPress={() => router.push(`/payments/${item.id}/edit`)}
      className="mb-4 rounded-xl p-4"
      style={{
        backgroundColor: COLORS.background.secondary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm" style={{ color: COLORS.gray[400] }}>
            {item.date}
          </Text>
          <Text className="mt-1 text-base" style={{ color: COLORS.secondary }}>
            {item.from}
          </Text>
          {item.description && (
            <Text className="mt-1 text-sm" style={{ color: COLORS.gray[600] }}>
              {item.description}
            </Text>
          )}
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray[400]} />
      </View>
    </Pressable>
  );
} 