// Web-specific implementation of adService
// This provides stub implementations for all the methods in the native adService

// Get the correct ad unit ID based on platform
const getAdUnitId = (adType: string) => {
  console.log(`Ad units not available on web platform (requested: ${adType})`);
  return 'test-ad-unit';
};

// App Open ad management
const loadAppOpenAd = () => {
  console.log('App Open ads not available on web platform');
  return () => { }; // Return empty cleanup function
};

const showAppOpenAd = async (): Promise<boolean> => {
  console.log('App Open ads not available on web platform');
  return false;
};

const isAppOpenAdAvailable = (): boolean => {
  return false; // Not available on web
};

// Interstitial ad management
const loadInterstitialAd = () => {
  console.log('Interstitial ads not available on web platform');
  return () => { }; // Return empty cleanup function
};

const showInterstitialAd = async (): Promise<boolean> => {
  console.log('Interstitial ads not available on web platform');
  return false;
};

// Rewarded ad management
const loadRewardedAd = () => {
  console.log('Rewarded ads not available on web platform');
  return () => { }; // Return empty cleanup function
};

const showRewardedAd = async (): Promise<boolean> => {
  console.log('Rewarded ads not available on web platform');
  return false;
};

// Initialize ads
const initializeAds = async () => {
  console.log('Mobile Ads SDK not available on web platform');
};

// Check tracking permission status
const getTrackingStatus = async () => {
  return 'authorized'; // Not applicable on web
};

// Request tracking permission
const requestTrackingPermission = async () => {
  return { status: 'authorized' }; // Not applicable on web
};

export const adService = {
  getAdUnitId,
  loadInterstitialAd,
  showInterstitialAd,
  loadRewardedAd,
  showRewardedAd,
  loadAppOpenAd,
  showAppOpenAd,
  isAppOpenAdAvailable,
  initializeAds,
  getTrackingStatus,
  requestTrackingPermission,
};
