import { View } from 'react-native';
import { COLORS } from '../constants/theme';
import Animated, {
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';

export const PaymentSkeleton = () => {
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
          <View className="h-6 w-24 rounded-lg" style={{ backgroundColor: COLORS.gray[200] }} />
          <View className="mt-2 flex-row items-center">
            <View className="h-4 w-4 rounded-full" style={{ backgroundColor: COLORS.gray[200] }} />
            <View className="ml-2 h-4 w-20 rounded-lg" style={{ backgroundColor: COLORS.gray[200] }} />
          </View>
          <View className="mt-1 h-3 w-32 rounded-lg" style={{ backgroundColor: COLORS.gray[200] }} />
        </View>
        <View className="rounded-full p-2" style={{ backgroundColor: COLORS.gray[100] }}>
          <View className="h-6 w-6 rounded-full" style={{ backgroundColor: COLORS.gray[200] }} />
        </View>
      </View>
    </Animated.View>
  );
};
