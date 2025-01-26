import { View } from 'react-native';
import { COLORS } from '../constants/theme';
import Animated, {
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';

export const WorkSkeleton = () => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(withTiming(0.3, { duration: 1000 }), withTiming(0.7, { duration: 1000 })),
      -1,
      true
    ),
  }));

  return (
    <Animated.View
      style={[
        {
          marginBottom: 12,
          backgroundColor: COLORS.background.secondary,
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        },
        animatedStyle,
      ]}>
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="h-5 w-24 rounded-md" style={{ backgroundColor: COLORS.gray[200] }} />
          <View
            className="ml-2 h-4 w-16 rounded-full"
            style={{ backgroundColor: COLORS.gray[200] }}
          />
        </View>
        <View className="h-6 w-20 rounded-md" style={{ backgroundColor: COLORS.gray[200] }} />
      </View>

      <View className="space-y-2">
        {[1, 2].map((_, index) => (
          <View key={index} className="flex-row items-center justify-between">
            <View className="h-4 w-32 rounded-md" style={{ backgroundColor: COLORS.gray[200] }} />
            <View className="h-4 w-20 rounded-md" style={{ backgroundColor: COLORS.gray[200] }} />
          </View>
        ))}
      </View>
    </Animated.View>
  );
};
