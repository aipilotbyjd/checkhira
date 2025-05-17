import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface OnboardingImageProps {
  type: 'work' | 'payment' | 'offline';
  size?: number;
}

const { width } = Dimensions.get('window');

export function OnboardingImage({ type, size = width * 0.5 }: OnboardingImageProps) {
  const renderIcon = () => {
    switch (type) {
      case 'work':
        return (
          <View style={[styles.iconContainer, { backgroundColor: `${COLORS.primary}15` }]}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={size * 0.5} color={COLORS.primary} />
          </View>
        );
      case 'payment':
        return (
          <View style={[styles.iconContainer, { backgroundColor: `${COLORS.primary}15` }]}>
            <FontAwesome5 name="money-bill-wave" size={size * 0.5} color={COLORS.primary} />
          </View>
        );
      case 'offline':
        return (
          <View style={[styles.iconContainer, { backgroundColor: `${COLORS.primary}15` }]}>
            <Ionicons name="cloud-offline-outline" size={size * 0.5} color={COLORS.primary} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {renderIcon()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});
