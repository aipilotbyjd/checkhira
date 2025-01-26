import { View } from 'react-native';
import { COLORS } from '../constants/theme';

export const PaymentFormSkeleton = () => {
  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      {/* Date Picker Skeleton */}
      <View className="px-6 pt-6">
        <View
          className="flex-row items-center rounded-2xl p-4"
          style={{ backgroundColor: COLORS.gray[100] }}>
          <View className="h-6 w-6 rounded bg-gray-200" />
          <View className="ml-3 h-5 flex-1 rounded bg-gray-200" />
          <View className="h-5 w-5 rounded bg-gray-200" />
        </View>

        <View className="mt-6 space-y-4">
          {/* Payment Source Skeleton */}
          <View>
            <View className="mb-3 h-4 w-32 rounded bg-gray-200" />
            <View className="flex-row flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <View key={i} className="h-10 w-24 rounded-full bg-gray-200" />
              ))}
            </View>
          </View>

          {/* Amount Field Skeleton */}
          <View>
            <View className="mb-2 h-4 w-20 rounded bg-gray-200" />
            <View className="h-12 rounded-xl bg-gray-200" />
            <View className="mt-1 h-3 w-32 rounded bg-gray-200" />
          </View>

          {/* Notes Field Skeleton */}
          <View>
            <View className="mb-2 h-4 w-16 rounded bg-gray-200" />
            <View className="h-24 rounded-xl bg-gray-200" />
          </View>
        </View>
      </View>

      {/* Save Button Skeleton */}
      <View className="mt-auto p-6">
        <View className="h-14 rounded-2xl bg-gray-200" />
      </View>
    </View>
  );
};
