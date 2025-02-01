import { View, Animated, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';
import { useEffect, useRef } from 'react';
import { useDimensions } from '../hooks/useScreenDimensions';

export function NotificationSkeleton() {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  const { width } = Dimensions.get('window');
  const { getScaledSize } = useDimensions();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Base sizes that will be scaled
  const BASE_PADDING = 16;
  const BASE_MARGIN = 12;
  const BASE_BORDER_RADIUS = 16;
  const BASE_ICON_SIZE = 40;
  const BASE_TITLE_HEIGHT = 20;
  const BASE_LINE_HEIGHT = 16;

  // Calculate responsive widths
  const containerWidth = width - (BASE_PADDING * 2);
  const titleWidth = containerWidth * 0.6;
  const shortLineWidth = containerWidth * 0.3;
  const longLineWidth = containerWidth * 0.8;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        marginBottom: BASE_MARGIN,
        width: containerWidth,
        alignSelf: 'center',
      }}>
      <View
        style={{
          backgroundColor: COLORS.white,
          borderRadius: BASE_BORDER_RADIUS,
          overflow: 'hidden',
          shadowColor: COLORS.gray[900],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}>
        {/* Status Bar */}
        <View style={{ height: 4, backgroundColor: COLORS.gray[200] }} />

        <View style={{ padding: BASE_PADDING }}>
          {/* Header Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: BASE_MARGIN }}>
            <View
              style={{
                height: BASE_ICON_SIZE,
                width: BASE_ICON_SIZE,
                borderRadius: BASE_ICON_SIZE / 2,
                backgroundColor: COLORS.gray[200],
                marginRight: BASE_MARGIN,
              }}
            />
            <View
              style={{
                height: BASE_TITLE_HEIGHT,
                width: titleWidth,
                borderRadius: 4,
                backgroundColor: COLORS.gray[200],
              }}
            />
          </View>

          {/* Message Lines */}
          <View style={{ marginBottom: BASE_MARGIN }}>
            <View
              style={{
                height: BASE_LINE_HEIGHT,
                width: longLineWidth,
                borderRadius: 4,
                backgroundColor: COLORS.gray[200],
                marginBottom: 8,
              }}
            />
            <View
              style={{
                height: BASE_LINE_HEIGHT,
                width: shortLineWidth,
                borderRadius: 4,
                backgroundColor: COLORS.gray[200],
              }}
            />
          </View>

          {/* Footer */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View
              style={{
                height: BASE_LINE_HEIGHT,
                width: shortLineWidth,
                borderRadius: 4,
                backgroundColor: COLORS.gray[200],
              }}
            />
            <View
              style={{
                height: BASE_LINE_HEIGHT,
                width: shortLineWidth,
                borderRadius: 4,
                backgroundColor: COLORS.gray[200],
              }}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
