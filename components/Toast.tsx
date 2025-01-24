import { useEffect } from 'react';
import { Animated, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onHide: () => void;
}

export function Toast({ message, type = 'success', onHide }: ToastProps) {
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getToastStyle = () => {
    switch (type) {
      case 'error':
        return { backgroundColor: COLORS.error };
      case 'info':
        return { backgroundColor: COLORS.primary };
      default:
        return { backgroundColor: COLORS.success };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return 'alert-circle';
      case 'info':
        return 'information';
      default:
        return 'check-circle';
    }
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          transform: [{ translateY }],
          opacity,
        },
      ]}>
      <View className="mx-4 mt-12 flex-row items-center rounded-lg p-4" style={getToastStyle()}>
        <MaterialCommunityIcons name={getIcon()} size={24} color="white" />
        <Text className="ml-2 flex-1 text-sm font-medium text-white">{message}</Text>
      </View>
    </Animated.View>
  );
}
