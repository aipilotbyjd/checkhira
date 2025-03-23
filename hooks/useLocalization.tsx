import { StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Hook to provide RTL-aware style transformations
 */
export function useLocalization() {
  const { isRTL, locale } = useLanguage();

  const getFlexDirection = (defaultDirection: 'row' | 'row-reverse' = 'row') => {
    if (defaultDirection === 'row') {
      return isRTL ? 'row-reverse' : 'row';
    }
    return isRTL ? 'row' : 'row-reverse';
  };

  const getTextAlign = (defaultAlign: 'left' | 'right' = 'left') => {
    if (defaultAlign === 'left') {
      return isRTL ? 'right' : 'left';
    }
    return isRTL ? 'left' : 'right';
  };

  const flipStyleSheet = (originalStyles: any) => {
    if (!isRTL) return originalStyles;

    const flippedStyles = { ...originalStyles };
    
    Object.keys(originalStyles).forEach(key => {
      const style = originalStyles[key];
      const flippedStyle = { ...style };
      
      // Handle margin and padding
      if (style.marginLeft) {
        flippedStyle.marginRight = style.marginLeft;
        delete flippedStyle.marginLeft;
      }
      if (style.marginRight) {
        flippedStyle.marginLeft = style.marginRight;
        delete flippedStyle.marginRight;
      }
      if (style.paddingLeft) {
        flippedStyle.paddingRight = style.paddingLeft;
        delete flippedStyle.paddingLeft;
      }
      if (style.paddingRight) {
        flippedStyle.paddingLeft = style.paddingRight;
        delete flippedStyle.paddingRight;
      }
      
      // Handle positioning
      if (style.left) {
        flippedStyle.right = style.left;
        delete flippedStyle.left;
      }
      if (style.right) {
        flippedStyle.left = style.right;
        delete flippedStyle.right;
      }
      
      // Handle text alignment
      if (style.textAlign === 'left') {
        flippedStyle.textAlign = 'right';
      } else if (style.textAlign === 'right') {
        flippedStyle.textAlign = 'left';
      }
      
      // Handle flex direction
      if (style.flexDirection === 'row') {
        flippedStyle.flexDirection = 'row-reverse';
      } else if (style.flexDirection === 'row-reverse') {
        flippedStyle.flexDirection = 'row';
      }
      
      flippedStyles[key] = flippedStyle;
    });
    
    return StyleSheet.create(flippedStyles);
  };
  
  return {
    isRTL,
    locale,
    getFlexDirection,
    getTextAlign,
    flipStyleSheet
  };
} 