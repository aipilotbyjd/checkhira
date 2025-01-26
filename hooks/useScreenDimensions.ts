import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize, Platform } from 'react-native';

export function useDimensions() {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription.remove();
  }, []);

  const { width, height } = dimensions;

  // Standardized breakpoints
  const breakpoints = {
    sm: 375,
    md: 414,
    lg: 768,
    xl: 1024,
  };

  // Device-specific helpers
  const isSmallDevice = width < breakpoints.sm;
  const isMediumDevice = width >= breakpoints.sm && width < breakpoints.md;
  const isLargeDevice = width >= breakpoints.md;
  const isTablet = width >= breakpoints.lg;

  // Height-based helpers
  const isShortDevice = height < 700;
  const isTallDevice = height >= 800;

  // Platform-specific adjustments
  const getScaledSize = (size: number) => {
    if (isSmallDevice) return size * 0.9;
    if (isTablet) return size * 1.2;
    return size;
  };

  // Common dimension calculations
  const getHeaderHeight = () => {
    if (Platform.OS === 'ios') {
      return isShortDevice ? 70 : 88;
    }
    return isSmallDevice ? 56 : 64;
  };

  const getTabBarHeight = () => {
    if (Platform.OS === 'ios') {
      return isShortDevice ? 70 : 85;
    }
    return isSmallDevice ? 56 : 64;
  };

  return {
    width,
    height,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    isTablet,
    isShortDevice,
    isTallDevice,
    getScaledSize,
    getHeaderHeight,
    getTabBarHeight,
    breakpoints,
  };
} 