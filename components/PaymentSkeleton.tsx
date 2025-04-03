import { Pressable, View, Text } from 'react-native';
import { COLORS } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';


export const PaymentSkeleton = () => {
  const router = useRouter();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [currentFilter, setCurrentFilter] = useState('all');
  const { t } = useLanguage();

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <View
        className="border-b px-6 pb-4 pt-6"
        style={{
          borderColor: COLORS.gray[200],
          backgroundColor: COLORS.background.primary,
        }}>
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: COLORS.secondary }}>
            {t('paymentsList')}
          </Text>
          <View className="flex-row space-x-3">
            <Pressable
              onPress={() => router.push('/payments/add')}
              className="mr-2 rounded-full p-3"
              style={{ backgroundColor: COLORS.primary }}>
              <MaterialCommunityIcons name="plus" size={22} color="white" />
            </Pressable>
            <Pressable
              onPress={() => actionSheetRef.current?.show()}
              className="rounded-full p-3"
              style={{ backgroundColor: COLORS.gray[100] }}>
              <MaterialCommunityIcons
                name="filter-variant"
                size={22}
                color={currentFilter === 'all' ? COLORS.gray[600] : COLORS.primary}
              />
            </Pressable>
          </View>
        </View>
      </View>

      <View className="my-6 px-4">
        <View className="rounded-xl p-4" style={{ backgroundColor: COLORS.primary + '15' }}>
          <View className="h-4 w-20 rounded bg-gray-200" />
          <View className="mt-2 h-8 w-32 rounded bg-gray-200" />
        </View>
      </View>

      <View className="px-4">
        {[...Array(4)].map((_, index) => (
          <View
            key={index}
            className="mb-4 rounded-xl p-4"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <View className="flex-row items-center justify-between">
              <View>
                <View className="h-5 w-24 rounded bg-gray-200" />
                <View className="mt-2 h-4 w-32 rounded bg-gray-200" />
                <View className="mt-1 h-3 w-20 rounded bg-gray-200" />
              </View>
              <View className="h-8 w-8 rounded-full bg-gray-200" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
