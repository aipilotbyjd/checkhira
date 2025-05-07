import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ViewStyle } from 'react-native';
import { adService } from '../../services/adService';
import { COLORS } from '../../constants/theme';
import * as TrackingTransparency from 'expo-tracking-transparency';

interface NativeAdComponentProps {
  containerStyle?: ViewStyle;
  adType?: 'small' | 'medium' | 'large';
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
}

export const NativeAdComponent = ({
  containerStyle = {},
  adType = 'medium',
  onAdLoaded,
  onAdFailedToLoad,
}: NativeAdComponentProps) => {
  const [nonPersonalizedOnly, setNonPersonalizedOnly] = useState(true);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  // Check tracking permission on iOS
  useEffect(() => {
    const checkTrackingPermission = async () => {
      if (Platform.OS === 'ios') {
        try {
          const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
          // If user granted permission, we can use personalized ads
          setNonPersonalizedOnly(status !== 'granted');
        } catch (error) {
          console.error('Error checking tracking permissions:', error);
          // Default to non-personalized ads if there's an error
          setNonPersonalizedOnly(true);
        }
      }
    };

    checkTrackingPermission();
  }, []);

  // This is a placeholder component until we can properly implement native ads
  // with the latest version of react-native-google-mobile-ads
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>
          Native Ad - {adType} format
        </Text>
        <Text style={styles.placeholderSubtext}>
          Native ads will appear here in production
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
    overflow: 'hidden',
  },
  placeholderContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    minHeight: 100,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginVertical: 10,
    overflow: 'hidden',
  },
  hidden: {
    opacity: 0,
    height: 0,
  },
  // Small ad styles
  smallAdContainer: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  smallAdContent: {
    padding: 10,
  },
  smallAdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  smallIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  smallAdMeta: {
    flex: 1,
  },
  smallAdvertiser: {
    fontSize: 12,
    color: COLORS.gray[600],
  },
  smallStarRating: {
    marginTop: 2,
  },
  smallAdBadge: {
    marginLeft: 'auto',
  },
  smallHeadline: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  smallCallToAction: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  smallCallToActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Medium ad styles
  mediumAdContainer: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mediumAdContent: {
    padding: 12,
  },
  mediumAdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediumIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  mediumAdMeta: {
    flex: 1,
  },
  mediumAdvertiser: {
    fontSize: 14,
    color: COLORS.gray[600],
  },
  mediumStarRating: {
    marginTop: 2,
  },
  mediumAdBadge: {
    marginLeft: 'auto',
  },
  mediumHeadline: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 6,
  },
  mediumBody: {
    fontSize: 14,
    color: COLORS.gray[700],
    marginBottom: 8,
  },
  mediumMediaView: {
    width: '100%',
    height: 150,
    marginBottom: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  mediumCallToAction: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  mediumCallToActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Large ad styles
  largeAdContainer: {
    width: '100%',
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  largeAdContent: {
    padding: 0,
  },
  largeMediaView: {
    width: '100%',
    height: 200,
    marginBottom: 12,
  },
  largeAdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  largeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  largeAdMeta: {
    flex: 1,
  },
  largeAdvertiser: {
    fontSize: 16,
    color: COLORS.gray[600],
  },
  largeStarRating: {
    marginTop: 4,
  },
  largeAdBadge: {
    marginLeft: 'auto',
  },
  largeHeadline: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  largeBody: {
    fontSize: 14,
    color: COLORS.gray[700],
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  largeCallToAction: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 16,
    marginLeft: 16,
  },
  largeCallToActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
