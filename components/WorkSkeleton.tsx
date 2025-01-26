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
      <View className="flex-row items-center justify-between">
        <View>
          <View className="h-4 w-24 rounded-lg" style={{ backgroundColor: COLORS.gray[200] }} />
          <View className="mt-2 h-5 w-32 rounded-lg" style={{ backgroundColor: COLORS.gray[200] }} />
        </View>
        <View>
          <View className="h-4 w-20 rounded-lg" style={{ backgroundColor: COLORS.gray[200] }} />
          <View className="mt-2 h-6 w-24 rounded-lg" style={{ backgroundColor: COLORS.gray[200] }} />
        </View>
      </View>
    </Animated.View>
  );
};
