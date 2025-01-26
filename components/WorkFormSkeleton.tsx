import { View, ScrollView } from 'react-native';
import { COLORS } from '../constants/theme';
import Animated, {
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useDimensions } from '../hooks/useScreenDimensions';

export const WorkFormSkeleton = () => {
  const { width, getScaledSize } = useDimensions();
  
  // Calculate responsive widths
  const CONTAINER_PADDING = getScaledSize(24); // 24 is the base padding
  const SPACING = getScaledSize(8);
  const ENTRY_WIDTH = (width - (CONTAINER_PADDING * 2) - (SPACING * 2)) / 3;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1000 }),
        withTiming(0.7, { duration: 1000 })
      ),
      -1,
      true
    ),
  }));

  const SkeletonBlock = ({ className, style }: { className?: string; style?: any }) => (
    <Animated.View
      className={className}
      style={[
        style,
        animatedStyle,
        {
          backgroundColor: COLORS.gray[200],
          borderRadius: getScaledSize(8),
        },
      ]}
    />
  );

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      {/* Date Picker Skeleton */}
      <View className="px-6 pt-6">
        <View
          className="flex-row items-center rounded-2xl p-4"
          style={{
            backgroundColor: COLORS.gray[100],
            height: 56,
          }}>
          <SkeletonBlock className="h-6 w-6 rounded-full" />
          <SkeletonBlock className="ml-3 h-5 flex-1 rounded-lg" />
          <SkeletonBlock className="ml-2 h-5 w-5 rounded-full" />
        </View>
      </View>

      {/* Name Field Skeleton */}
      <View className="px-6">
        <View className="mb-2 mt-4 flex-row items-center">
          <SkeletonBlock className="h-4 w-16 rounded-lg" />
          <SkeletonBlock
            className="ml-1 h-3 w-3 rounded-full"
            style={{ backgroundColor: COLORS.error }}
          />
        </View>
        <View
          className="rounded-xl border p-4"
          style={{
            backgroundColor: COLORS.white,
            borderColor: COLORS.gray[200],
            height: 56,
          }}>
          <SkeletonBlock className="h-6 w-3/4 rounded-lg" />
        </View>
      </View>

      {/* Entries Section */}
      <ScrollView className="mt-6 flex-1 px-6">
        <View className="mb-4 flex-row items-center justify-between">
          <SkeletonBlock className="h-7 w-32 rounded-lg" />
          <View className="flex-row items-center space-x-3">
            <View
              className="rounded-lg p-2.5"
              style={{
                backgroundColor: COLORS.error + '15',
                height: 40,
                width: 40,
              }}>
              <SkeletonBlock className="h-5 w-5 rounded-lg" />
            </View>
            <View
              className="rounded-lg p-2.5"
              style={{
                backgroundColor: COLORS.primary + '15',
                height: 40,
                width: 40,
              }}>
              <SkeletonBlock className="h-5 w-5 rounded-lg" />
            </View>
          </View>
        </View>

        {[1, 2].map((index) => (
          <View
            key={index}
            className="mb-4 rounded-2xl p-4"
            style={{
              backgroundColor: COLORS.background.secondary,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2,
            }}>
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <SkeletonBlock className="h-5 w-20 rounded-lg" />
                <View
                  className="ml-2 rounded-full px-3 py-1"
                  style={{ backgroundColor: COLORS.primary + '15' }}>
                  <SkeletonBlock className="h-6 w-6 rounded-lg" />
                </View>
              </View>
              {index !== 0 && (
                <View
                  className="rounded-lg p-2"
                  style={{
                    backgroundColor: COLORS.error + '15',
                    height: 36,
                    width: 36,
                  }}>
                  <SkeletonBlock className="h-5 w-5 rounded-lg" />
                </View>
              )}
            </View>

            <View className="flex-row space-x-3">
              {['Diamond', 'Price', 'Total'].map((field, idx) => (
                <View key={field} style={{ width: ENTRY_WIDTH }}>
                  <SkeletonBlock className="mb-2 h-4 w-16 rounded-lg" />
                  <View
                    className="rounded-xl border p-4"
                    style={{
                      height: 56,
                      backgroundColor: idx === 2 ? COLORS.gray[100] : COLORS.white,
                      borderColor: COLORS.gray[200],
                    }}>
                    <SkeletonBlock className="h-6 w-full rounded-lg" />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View className="px-6 pb-6">
        <View
          className="mb-4 rounded-2xl p-4"
          style={{
            backgroundColor: COLORS.primary + '10',
            height: 72,
          }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <SkeletonBlock className="h-7 w-7 rounded-full" />
              <SkeletonBlock className="ml-3 h-6 w-36 rounded-lg" />
            </View>
            <SkeletonBlock className="h-8 w-28 rounded-lg" />
          </View>
        </View>

        <View className="space-y-3">
          <View
            className="h-14 rounded-2xl"
            style={{
              backgroundColor: COLORS.primary,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}>
            <SkeletonBlock className="h-full w-full rounded-2xl opacity-20" />
          </View>
          <View
            className="h-14 rounded-2xl"
            style={{
              backgroundColor: COLORS.error + '15',
              borderWidth: 1,
              borderColor: COLORS.error + '20',
            }}>
            <SkeletonBlock className="h-full w-full rounded-2xl opacity-20" />
          </View>
        </View>
      </View>
    </View>
  );
};
