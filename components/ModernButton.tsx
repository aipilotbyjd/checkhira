import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Animated, 
  View,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { COLORS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface ModernButtonProps {
  label?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
}

const { width } = Dimensions.get('window');

export function ModernButton({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'right',
  fullWidth = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ModernButtonProps) {
  const [pressAnim] = useState(new Animated.Value(1));
  
  // Handle press animation
  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  // Get button styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? `${COLORS.primary}80` : COLORS.primary,
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? `${COLORS.secondary}80` : COLORS.secondary,
          borderColor: 'transparent',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: disabled ? `${COLORS.primary}80` : COLORS.primary,
          borderWidth: 2,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
        };
      default:
        return {
          backgroundColor: disabled ? `${COLORS.primary}80` : COLORS.primary,
          borderColor: 'transparent',
        };
    }
  };
  
  // Get text styles based on variant
  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return {
          color: '#FFFFFF',
        };
      case 'outline':
      case 'text':
        return {
          color: disabled ? `${COLORS.primary}80` : COLORS.primary,
        };
      default:
        return {
          color: '#FFFFFF',
        };
    }
  };
  
  // Get button size
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
        };
      case 'medium':
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 12,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 16,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 12,
        };
    }
  };
  
  // Get icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'medium': return 20;
      case 'large': return 24;
      default: return 20;
    }
  };
  
  // Render button content
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getTextStyles().color} />;
    }
    
    const iconSize = getIconSize();
    const iconColor = getTextStyles().color;
    
    return (
      <>
        {icon && iconPosition === 'left' && (
          <Ionicons 
            name={icon} 
            size={iconSize} 
            color={iconColor} 
            style={styles.leftIcon} 
          />
        )}
        
        {label && <Text style={[styles.text, getTextStyles(), textStyle]}>{label}</Text>}
        
        {icon && iconPosition === 'right' && (
          <Ionicons 
            name={icon} 
            size={iconSize} 
            color={iconColor} 
            style={styles.rightIcon} 
          />
        )}
      </>
    );
  };
  
  return (
    <Animated.View
      style={[
        { transform: [{ scale: pressAnim }] },
        fullWidth && { width: '100%' },
      ]}
    >
      <TouchableOpacity
        onPress={disabled || loading ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        style={[
          styles.button,
          getButtonStyles(),
          getButtonSize(),
          fullWidth && styles.fullWidth,
          style,
        ]}
        disabled={disabled || loading}
      >
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
