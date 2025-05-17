import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

interface ModernPaginationProps {
  data: any[];
  scrollX: Animated.Value;
  dotSize?: number;
  dotSpacing?: number;
  activeDotColor?: string;
  inactiveDotColor?: string;
  style?: any;
}

const { width } = Dimensions.get('window');

export function ModernPagination({
  data,
  scrollX,
  dotSize = 10,
  dotSpacing = 8,
  activeDotColor = COLORS.primary,
  inactiveDotColor = `${COLORS.primary}40`,
  style,
}: ModernPaginationProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Background track */}
      <View 
        style={[
          styles.track, 
          { 
            width: (dotSize + dotSpacing) * data.length - dotSpacing,
            height: dotSize / 2,
            borderRadius: dotSize / 4,
            backgroundColor: inactiveDotColor,
          }
        ]} 
      />
      
      {/* Animated dots */}
      {data.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];
        
        // Scale animation
        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [0.8, 1.2, 0.8],
          extrapolate: 'clamp',
        });
        
        // Opacity animation
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: 'clamp',
        });
        
        // Position animation for the active indicator
        const translateX = scrollX.interpolate({
          inputRange: [0, width * data.length],
          outputRange: [0, (dotSize + dotSpacing) * data.length],
          extrapolate: 'clamp',
        });
        
        return (
          <Animated.View
            key={`dot-${index}`}
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                marginHorizontal: dotSpacing / 2,
                backgroundColor: activeDotColor,
                opacity,
                transform: [{ scale }],
                left: index * (dotSize + dotSpacing),
              },
            ]}
          />
        );
      })}
      
      {/* Active indicator line */}
      <Animated.View
        style={[
          styles.activeLine,
          {
            width: dotSize * 2,
            height: dotSize / 2,
            borderRadius: dotSize / 4,
            backgroundColor: activeDotColor,
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: [...Array(data.length).keys()].map(i => i * width),
                  outputRange: [...Array(data.length).keys()].map(
                    i => i * (dotSize + dotSpacing) - dotSize / 2
                  ),
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    position: 'relative',
  },
  track: {
    position: 'absolute',
    top: '50%',
    left: 0,
    transform: [{ translateY: -2 }],
  },
  dot: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -5 }],
  },
  activeLine: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -2 }],
  },
});
