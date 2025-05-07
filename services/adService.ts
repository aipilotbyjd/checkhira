import { Platform, AppState, AppStateStatus } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  MobileAds,
  AppOpenAd,
  AdsConsent,
  AdsConsentStatus,
  AdsConsentDebugGeography,
  MaxAdContentRating,
  RequestConfiguration,
} from 'react-native-google-mobile-ads';
import { environment } from '../config/environment';
import * as TrackingTransparency from 'expo-tracking-transparency';

// TypeScript interfaces for ad unit IDs
interface PlatformSpecificAdUnitId {
  android: string;
  ios: string;
}

interface AdUnitIds {
  banner: PlatformSpecificAdUnitId;
  interstitial: PlatformSpecificAdUnitId;
  rewarded: PlatformSpecificAdUnitId;
  appOpen: PlatformSpecificAdUnitId;
  native: PlatformSpecificAdUnitId;
}

// Use test IDs for development and real IDs for production
const useTestIds = !environment.production;

// Ad unit IDs
const adUnitIds: AdUnitIds = {
  banner: {
    android: useTestIds ? TestIds.BANNER : 'ca-app-pub-6156225952846626/1234567890',
    ios: useTestIds ? TestIds.BANNER : 'ca-app-pub-6156225952846626/1234567890',
  },
  interstitial: {
    android: useTestIds ? TestIds.INTERSTITIAL : 'ca-app-pub-6156225952846626/2345678901',
    ios: useTestIds ? TestIds.INTERSTITIAL : 'ca-app-pub-6156225952846626/2345678901',
  },
  rewarded: {
    android: useTestIds ? TestIds.REWARDED : 'ca-app-pub-6156225952846626/3456789012',
    ios: useTestIds ? TestIds.REWARDED : 'ca-app-pub-6156225952846626/3456789012',
  },
  appOpen: {
    android: useTestIds ? TestIds.APP_OPEN : 'ca-app-pub-6156225952846626/4567890123',
    ios: useTestIds ? TestIds.APP_OPEN : 'ca-app-pub-6156225952846626/4567890123',
  },
  native: {
    android: useTestIds ? TestIds.NATIVE : 'ca-app-pub-6156225952846626/5678901234',
    ios: useTestIds ? TestIds.NATIVE : 'ca-app-pub-6156225952846626/5678901234',
  },
};

// Get the correct ad unit ID based on platform
const getAdUnitId = (adType: keyof AdUnitIds): string => {
  return Platform.OS === 'ios' ? adUnitIds[adType].ios : adUnitIds[adType].android;
};

// App Open ad management
let appOpenAd: AppOpenAd | null = null;
let appOpenAdLoadTime = 0;
let isAppOpenAdLoading = false;
let isAppOpenAdLoaded = false;

// Function to check if an app open ad is ready to be shown
const isAppOpenAdAvailable = (): boolean => {
  return !!appOpenAd && isAppOpenAdLoaded && (Date.now() - appOpenAdLoadTime < 3600000); // Ad expires after 1 hour
};

// Load an app open ad
const loadAppOpenAd = () => {
  // Don't try to load if already loading
  if (isAppOpenAdLoading) {
    return () => { };
  }

  isAppOpenAdLoading = true;
  isAppOpenAdLoaded = false;

  const adUnitId = getAdUnitId('appOpen');
  appOpenAd = AppOpenAd.createForAdRequest(adUnitId);

  const unsubscribeLoaded = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
    console.log('App open ad loaded');
    appOpenAdLoadTime = Date.now();
    isAppOpenAdLoaded = true;
    isAppOpenAdLoading = false;
  });

  const unsubscribeClosed = appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('App open ad closed');
    isAppOpenAdLoaded = false;
    // Reload the ad for next time
    loadAppOpenAd();
  });

  const unsubscribeError = appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
    console.error('App open ad error:', error);
    appOpenAd = null;
    isAppOpenAdLoaded = false;
    isAppOpenAdLoading = false;
  });

  // Start loading
  appOpenAd.load();

  return () => {
    unsubscribeLoaded();
    unsubscribeClosed();
    unsubscribeError();
  };
};

// Show an app open ad
const showAppOpenAd = async (): Promise<boolean> => {
  if (!isAppOpenAdAvailable()) {
    console.log('App open ad not available or not loaded yet');

    // If not already loading, start loading a new one
    if (!isAppOpenAdLoading) {
      loadAppOpenAd();
    }

    return false;
  }

  try {
    if (appOpenAd && isAppOpenAdLoaded) {
      await appOpenAd.show();
      return true;
    } else {
      console.log('App open ad not fully loaded yet');
      return false;
    }
  } catch (error) {
    console.error('Error showing app open ad:', error);
    // Reset state and try to load a new ad
    isAppOpenAdLoaded = false;
    loadAppOpenAd();
    return false;
  }
};

// Interstitial ad management
let interstitialAd: InterstitialAd | null = null;

const loadInterstitialAd = () => {
  const adUnitId = getAdUnitId('interstitial');
  interstitialAd = InterstitialAd.createForAdRequest(adUnitId);

  const unsubscribeLoaded = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    console.log('Interstitial ad loaded');
  });

  const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('Interstitial ad closed');
    // Reload the ad for next time
    interstitialAd?.load();
  });

  const unsubscribeError = interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
    console.error('Interstitial ad error:', error);
  });

  // Start loading
  interstitialAd.load();

  return () => {
    unsubscribeLoaded();
    unsubscribeClosed();
    unsubscribeError();
  };
};

const showInterstitialAd = async (): Promise<boolean> => {
  if (!interstitialAd) {
    console.log('Interstitial ad not loaded yet');
    loadInterstitialAd();
    return false;
  }

  if (!interstitialAd.loaded) {
    console.log('Interstitial ad still loading');
    return false;
  }

  await interstitialAd.show();
  return true;
};

// Rewarded ad management
let rewardedAd: RewardedAd | null = null;

const loadRewardedAd = () => {
  const adUnitId = getAdUnitId('rewarded');
  rewardedAd = RewardedAd.createForAdRequest(adUnitId);

  const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
    console.log('Rewarded ad loaded');
  });

  const unsubscribeEarned = rewardedAd.addAdEventListener(
    RewardedAdEventType.EARNED_REWARD,
    (reward) => {
      console.log('User earned reward:', reward);
    }
  );

  const unsubscribeClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('Rewarded ad closed');
    // Reload the ad for next time
    rewardedAd?.load();
  });

  const unsubscribeError = rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
    console.error('Rewarded ad error:', error);
  });

  // Start loading
  rewardedAd.load();

  return () => {
    unsubscribeLoaded();
    unsubscribeEarned();
    unsubscribeClosed();
    unsubscribeError();
  };
};

const showRewardedAd = async (): Promise<boolean> => {
  if (!rewardedAd) {
    console.log('Rewarded ad not loaded yet');
    loadRewardedAd();
    return false;
  }

  if (!rewardedAd.loaded) {
    console.log('Rewarded ad still loading');
    return false;
  }

  await rewardedAd.show();
  return true;
};

/**
 * Initialize ads with proper consent handling
 * This follows the latest Google Mobile Ads SDK recommendations
 */
const initializeAds = async (): Promise<void> => {
  try {
    // Request tracking permission on iOS
    if (Platform.OS === 'ios') {
      // Wait a bit for app to properly initialize
      await new Promise(resolve => setTimeout(resolve, 200));

      // Request tracking authorization
      const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
      console.log('Tracking permission status:', status);
    }

    // Step 1: Request user consent information
    const consentInfo = await AdsConsent.requestInfoUpdate({
      debugGeography: environment.production
        ? AdsConsentDebugGeography.DISABLED
        : AdsConsentDebugGeography.EEA,
      testDeviceIdentifiers: [], // Add test device IDs here if needed
    });

    // Step 2: Show the consent form if required
    if (consentInfo.isConsentFormAvailable &&
        (consentInfo.status === AdsConsentStatus.REQUIRED ||
         consentInfo.status === AdsConsentStatus.UNKNOWN)) {
      try {
        const formStatus = await AdsConsent.showForm();
        console.log('Consent form status:', formStatus);
      } catch (formError) {
        console.error('Error showing consent form:', formError);
      }
    }

    // Step 3: Configure the Mobile Ads SDK with appropriate settings
    await MobileAds().setRequestConfiguration({
      // Set max ad content rating
      maxAdContentRating: MaxAdContentRating.PG,
      // Specify if you want to request ads for children
      tagForChildDirectedTreatment: false,
      // Specify if you want to request ads for users under the age of consent
      tagForUnderAgeOfConsent: false,
    } as RequestConfiguration);

    // Step 4: Initialize the Mobile Ads SDK
    await MobileAds().initialize();
    console.log('Mobile Ads SDK initialized successfully');

    // Load ads with a slight delay to ensure SDK is fully initialized
    await new Promise(resolve => setTimeout(resolve, 500));

    // Preload all ad types
    loadAppOpenAd();
    loadInterstitialAd();
    loadRewardedAd();

    // Wait a bit more to ensure app open ad has time to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if app open ad loaded successfully
    if (!isAppOpenAdLoaded && !isAppOpenAdLoading) {
      console.log('Retrying app open ad load after initial failure');
      loadAppOpenAd();
    }

    // Set up app state change listener for app open ads
    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // Only show app open ads when coming from background to foreground
      if (nextAppState === 'active') {
        // Don't show immediately, give a small delay
        setTimeout(() => {
          if (isAppOpenAdAvailable()) {
            showAppOpenAd();
          } else {
            loadAppOpenAd();
          }
        }, 500);
      }
    });
  } catch (error) {
    console.error('Failed to initialize Mobile Ads SDK:', error);

    // Try to recover by loading ads anyway
    try {
      // Initialize with default settings
      await MobileAds().initialize();

      loadAppOpenAd();
      loadInterstitialAd();
      loadRewardedAd();
    } catch (loadError) {
      console.error('Failed to load ads after SDK initialization error:', loadError);
    }
  }
};

// Check tracking permission status
const getTrackingStatus = async () => {
  if (Platform.OS !== 'ios') {
    return 'authorized'; // Not applicable on Android
  }

  try {
    const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
    return status;
  } catch (error) {
    console.error('Error getting tracking status:', error);
    return 'denied'; // Default to denied on error
  }
};

// Request tracking permission
const requestTrackingPermission = async () => {
  if (Platform.OS !== 'ios') {
    return { status: 'authorized' }; // Not applicable on Android
  }

  try {
    return await TrackingTransparency.requestTrackingPermissionsAsync();
  } catch (error) {
    console.error('Error requesting tracking permission:', error);
    return { status: 'denied' }; // Default to denied on error
  }
};

/**
 * Get the current consent status
 */
const getConsentStatus = async (): Promise<AdsConsentStatus> => {
  try {
    const consentInfo = await AdsConsent.requestInfoUpdate({
      debugGeography: environment.production
        ? AdsConsentDebugGeography.DISABLED
        : AdsConsentDebugGeography.EEA,
    });
    return consentInfo.status;
  } catch (error) {
    console.error('Error getting consent status:', error);
    return AdsConsentStatus.UNKNOWN;
  }
};

/**
 * Show the consent form manually
 */
const showConsentForm = async (): Promise<boolean> => {
  try {
    const consentInfo = await AdsConsent.requestInfoUpdate({
      debugGeography: environment.production
        ? AdsConsentDebugGeography.DISABLED
        : AdsConsentDebugGeography.EEA,
    });

    if (consentInfo.isConsentFormAvailable) {
      await AdsConsent.showForm();
      return true;
    } else {
      console.log('Consent form is not available');
      return false;
    }
  } catch (error) {
    console.error('Error showing consent form:', error);
    return false;
  }
};

/**
 * Reset the consent information
 */
const resetConsent = async (): Promise<void> => {
  try {
    await AdsConsent.reset();
    console.log('Consent information reset successfully');
  } catch (error) {
    console.error('Error resetting consent:', error);
  }
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
  // New consent methods
  getConsentStatus,
  showConsentForm,
  resetConsent,
};
