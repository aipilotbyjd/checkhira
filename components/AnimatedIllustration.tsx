import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface AnimatedIllustrationProps {
  type: 'work' | 'payment' | 'offline' | 'analytics';
  size?: number;
  style?: any;
}

const { width } = Dimensions.get('window');

export function AnimatedIllustration({ 
  type, 
  size = width * 0.5,
  style
}: AnimatedIllustrationProps) {
  // Animation values
  const scale = useRef(new Animated.Value(0.9)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;
  
  // Start animations when component mounts
  useEffect(() => {
    // Scale animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
    
    // Rotation animation for specific types
    if (type === 'work' || type === 'analytics') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotate, {
            toValue: 0.02, // Subtle rotation
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(rotate, {
            toValue: -0.02, // Subtle rotation in opposite direction
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
    
    // Opacity animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);
  
  // Convert rotation value to degrees string for transform
  const spin = rotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-30deg', '30deg'],
  });
  
  // Render different illustrations based on type
  const renderIllustration = () => {
    const iconSize = size * 0.5;
    const secondaryIconSize = size * 0.25;
    
    switch (type) {
      case 'work':
        return (
          <View style={styles.illustrationContainer}>
            <MaterialCommunityIcons 
              name="clipboard-text-outline" 
              size={iconSize} 
              color={COLORS.primary} 
            />
            <View style={[styles.secondaryIcon, { bottom: 10, right: 10 }]}>
              <MaterialCommunityIcons 
                name="clock-outline" 
                size={secondaryIconSize} 
                color={COLORS.secondary} 
              />
            </View>
          </View>
        );
      case 'payment':
        return (
          <View style={styles.illustrationContainer}>
            <FontAwesome5 
              name="money-bill-wave" 
              size={iconSize} 
              color={COLORS.primary} 
            />
            <View style={[styles.secondaryIcon, { bottom: 10, right: 10 }]}>
              <MaterialCommunityIcons 
                name="credit-card-outline" 
                size={secondaryIconSize} 
                color={COLORS.secondary} 
              />
            </View>
          </View>
        );
      case 'offline':
        return (
          <View style={styles.illustrationContainer}>
            <Ionicons 
              name="cloud-offline-outline" 
              size={iconSize} 
              color={COLORS.primary} 
            />
            <View style={[styles.secondaryIcon, { bottom: 10, right: 10 }]}>
              <MaterialCommunityIcons 
                name="sync" 
                size={secondaryIconSize} 
                color={COLORS.secondary} 
              />
            </View>
          </View>
        );
      case 'analytics':
        return (
          <View style={styles.illustrationContainer}>
            <MaterialCommunityIcons 
              name="chart-bar" 
              size={iconSize} 
              color={COLORS.primary} 
            />
            <View style={[styles.secondaryIcon, { bottom: 10, right: 10 }]}>
              <MaterialCommunityIcons 
                name="trending-up" 
                size={secondaryIconSize} 
                color={COLORS.secondary} 
              />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          width: size, 
          height: size,
          transform: [
            { scale },
            { rotate: spin }
          ],
          opacity,
        },
        style
      ]}
    >
      {renderIllustration()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  illustrationContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  secondaryIcon: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});
