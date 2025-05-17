import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

interface GradientBackgroundProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
  children?: React.ReactNode;
  style?: any;
}

const { width, height } = Dimensions.get('window');

export function GradientBackground({ 
  variant = 'primary', 
  children, 
  style 
}: GradientBackgroundProps) {
  // Define gradient colors based on variant
  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return [
          `${COLORS.primary}10`, // Very light primary
          `${COLORS.primary}20`, // Light primary
        ];
      case 'secondary':
        return [
          `${COLORS.secondary}10`, // Very light secondary
          `${COLORS.secondary}20`, // Light secondary
        ];
      case 'tertiary':
        return [
          '#f8f9fa',
          '#e9ecef',
        ];
      case 'quaternary':
        return [
          '#e3f2fd',
          '#bbdefb',
        ];
      default:
        return [
          `${COLORS.primary}10`,
          `${COLORS.primary}20`,
        ];
    }
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={getGradientColors()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
