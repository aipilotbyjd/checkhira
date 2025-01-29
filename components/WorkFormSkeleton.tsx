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
  
  // Calculate responsive widths and spacings
  const CONTAINER_PADDING = getScaledSize(24);
  const SPACING = getScaledSize(8);
  const ENTRY_WIDTH = (width - (CONTAINER_PADDING * 2) - (SPACING * 2)) / 3;
  const VERTICAL_SPACING = getScaledSize(16);
  const SECTION_SPACING = getScaledSize(24);

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
      <View style={{ padding: CONTAINER_PADDING, paddingBottom: VERTICAL_SPACING }}>
        <View
          className="flex-row items-center rounded-2xl"
          style={{
            backgroundColor: COLORS.gray[100],
            height: getScaledSize(56),
            padding: getScaledSize(16),
          }}>
          <SkeletonBlock className="h-6 w-6 rounded-full" />
          <SkeletonBlock className="ml-3 h-5 flex-1 rounded-lg" />
          <SkeletonBlock className="ml-2 h-5 w-5 rounded-full" />
        </View>
      </View>

      {/* Name Field Skeleton */}
      <View style={{ paddingHorizontal: CONTAINER_PADDING, marginBottom: SECTION_SPACING }}>
        <View className="mb-2 flex-row items-center">
          <SkeletonBlock className="h-4 w-16 rounded-lg" />
          <SkeletonBlock
            className="ml-1 h-3 w-3 rounded-full"
            style={{ backgroundColor: COLORS.error }}
          />
        </View>
        <View
          className="rounded-xl border"
          style={{
            backgroundColor: COLORS.white,
            borderColor: COLORS.gray[200],
            height: getScaledSize(45),
            padding: getScaledSize(16),
          }}>
          <SkeletonBlock className="h-6 w-3/4 rounded-lg" />
        </View>
      </View>

      {/* Entries Section */}
      <ScrollView style={{ paddingHorizontal: CONTAINER_PADDING }}>
        <View className="mb-4 flex-row items-center justify-between">
          <SkeletonBlock className="h-7 w-32 rounded-lg" />
          <View className="flex-row items-center" style={{ gap: SPACING }}>
            <View
              className="rounded-lg"
              style={{
                backgroundColor: COLORS.error + '15',
                padding: getScaledSize(10),
                height: getScaledSize(40),
                width: getScaledSize(40),
              }}>
              <SkeletonBlock className="h-5 w-5 rounded-lg" />
            </View>
            <View
              className="rounded-lg"
              style={{
                backgroundColor: COLORS.primary + '15',
                padding: getScaledSize(10),
                height: getScaledSize(40),
                width: getScaledSize(40),
              }}>
              <SkeletonBlock className="h-5 w-5 rounded-lg" />
            </View>
          </View>
        </View>

        {[1, 2].map((index) => (
          <View
            key={index}
            className="mb-4 rounded-2xl"
            style={{
              backgroundColor: COLORS.background.secondary,
              padding: getScaledSize(16),
              marginBottom: VERTICAL_SPACING,
              ...getShadowStyle(),
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
                  className="rounded-lg"
                  style={{
                    backgroundColor: COLORS.error + '15',
                    padding: getScaledSize(8),
                    height: getScaledSize(33),
                    width: getScaledSize(28),
                  }}>
                  <SkeletonBlock className="h-5 w-5 rounded-lg" />
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: SPACING }}>
              {['Diamond', 'Price', 'Total'].map((field, idx) => (
                <View key={field} style={{ width: ENTRY_WIDTH - getScaledSize(16) }}>
                  <SkeletonBlock className="mb-2 h-4 w-16 rounded-lg" />
                  <View
                    className="rounded-xl border"
                    style={{
                      height: getScaledSize(45),
                      backgroundColor: idx === 2 ? COLORS.gray[100] : COLORS.white,
                      borderColor: COLORS.gray[200],
                      padding: getScaledSize(16),
                    }}>
                    <SkeletonBlock className="w-full rounded-lg" />
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={{ padding: CONTAINER_PADDING }}>
        <View
          className="mb-4 rounded-2xl"
          style={{
            backgroundColor: COLORS.primary + '10',
            padding: getScaledSize(16),
            marginBottom: VERTICAL_SPACING,
          }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <SkeletonBlock className="h-7 w-7 rounded-full" />
              <SkeletonBlock className="ml-3 h-6 w-36 rounded-lg" />
            </View>
            <SkeletonBlock className="h-8 w-28 rounded-lg" />
          </View>
        </View>

        <View style={{ gap: SPACING }}>
          <View
            className="rounded-2xl"
            style={{
              height: getScaledSize(56),
              backgroundColor: COLORS.primary,
              ...getShadowStyle(COLORS.primary),
            }}>
            <SkeletonBlock className="h-full w-full rounded-2xl opacity-20" />
          </View>
          <View
            className="rounded-2xl"
            style={{
              height: getScaledSize(56),
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

const getShadowStyle = (shadowColor = '#000') => ({
  shadowColor,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
});
