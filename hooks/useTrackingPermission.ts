import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as TrackingTransparency from 'expo-tracking-transparency';

type TrackingStatus = 'unavailable' | 'denied' | 'authorized' | 'restricted' | 'not-determined';

export function useTrackingPermission() {
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('not-determined');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      if (Platform.OS !== 'ios') {
        // Tracking permission is only relevant on iOS
        setTrackingStatus('authorized');
        setIsLoading(false);
        return;
      }

      try {
        const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
        setTrackingStatus(status);
      } catch (error) {
        console.error('Error checking tracking permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, []);

  const requestPermission = async (): Promise<TrackingStatus> => {
    if (Platform.OS !== 'ios') {
      return 'authorized';
    }

    try {
      setIsLoading(true);
      const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
      setTrackingStatus(status);
      return status;
    } catch (error) {
      console.error('Error requesting tracking permissions:', error);
      return 'denied';
    } finally {
      setIsLoading(false);
    }
  };

  return {
    trackingStatus,
    isLoading,
    requestPermission,
    isAuthorized: trackingStatus === 'authorized',
  };
}
