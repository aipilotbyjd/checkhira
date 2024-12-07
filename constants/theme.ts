import { Platform } from 'react-native';

export const COLORS = {
  primary: '#fc8019',
  secondary: '#282c3f',
  gray: {
    100: '#f2f2f2',
    200: '#e6e6e6',
    300: '#cccccc',
    400: '#7a7e8e',
    500: '#595959',
    600: '#3d4152',
    700: '#262626',
  },
  success: '#48c479',
  error: '#ff3838',
  warning: '#ffa700',
  info: '#3498db',
  white: '#ffffff',
  black: '#000000',
  background: {
    primary: '#ffffff',
    secondary: '#f8f8f8',
  },
} as const;

export const SCREEN_SIZES = {
  xs: 320,
  sm: 375,
  md: 414,
  lg: 428,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  tabBarHeight: {
    ios: Platform.OS === 'ios' ? (SCREEN_SIZES.sm > 375 ? 90 : 80) : 90,
    android: Platform.OS === 'android' ? (SCREEN_SIZES.sm > 375 ? 64 : 56) : 64,
  },
  tabBarPadding: {
    ios: Platform.OS === 'ios' ? (SCREEN_SIZES.sm > 375 ? 30 : 25) : 30,
    android: Platform.OS === 'android' ? (SCREEN_SIZES.sm > 375 ? 5 : 3) : 5,
  },
  screenPadding: SCREEN_SIZES.sm > 375 ? 16 : 12,
  sectionPadding: SCREEN_SIZES.sm > 375 ? 24 : 20,
} as const;

export const SIZES = {
  // Typography
  h1: SCREEN_SIZES.sm > 375 ? 32 : 28,
  h2: SCREEN_SIZES.sm > 375 ? 24 : 22,
  h3: SCREEN_SIZES.sm > 375 ? 20 : 18,
  h4: SCREEN_SIZES.sm > 375 ? 18 : 16,
  body: SCREEN_SIZES.sm > 375 ? 16 : 14,
  caption: SCREEN_SIZES.sm > 375 ? 14 : 12,
  small: SCREEN_SIZES.sm > 375 ? 12 : 10,
  
  // UI Elements
  tabIcon: SCREEN_SIZES.sm > 375 ? 24 : 20,
  tabLabel: SCREEN_SIZES.sm > 375 ? 12 : 10,
  buttonHeight: SCREEN_SIZES.sm > 375 ? 48 : 44,
  inputHeight: SCREEN_SIZES.sm > 375 ? 44 : 40,
  borderRadius: SCREEN_SIZES.sm > 375 ? 8 : 6,
  iconSize: {
    small: SCREEN_SIZES.sm > 375 ? 16 : 14,
    medium: SCREEN_SIZES.sm > 375 ? 24 : 20,
    large: SCREEN_SIZES.sm > 375 ? 32 : 28,
  },
} as const;

export const FONTS = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System-Medium',
    android: 'Roboto-Medium',
    default: 'System-Medium',
  }),
  bold: Platform.select({
    ios: 'System-Bold',
    android: 'Roboto-Bold',
    default: 'System-Bold',
  }),
  semibold: Platform.select({
    ios: 'System-Semibold',
    android: 'Roboto-Medium',
    default: 'System-Semibold',
  }),
} as const;

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
} as const;
