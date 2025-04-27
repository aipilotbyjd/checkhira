// Web-specific implementation of the useTrackingPermission hook

type TrackingStatus = 'unavailable' | 'denied' | 'authorized' | 'restricted' | 'not-determined';

export function useTrackingPermission() {
  // On web, we always return authorized since tracking permissions
  // are handled differently (through cookies/GDPR consent)
  return {
    trackingStatus: 'authorized' as TrackingStatus,
    isLoading: false,
    requestPermission: async () => 'authorized' as TrackingStatus,
    isAuthorized: true,
  };
}
