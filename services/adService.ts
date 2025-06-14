import { Platform, AppState, AppStateStatus } from 'react-native';
import { environment } from '../config/environment';

// Import directly to ensure they're available immediately
import {
  TestIds,
  AdEventType,
  RewardedAdEventType,
  MobileAds,
  MaxAdContentRating,
  AdsConsentStatus,
  AppOpenAd,
  InterstitialAd,
  RewardedAd,
} from 'react-native-google-mobile-ads';

// Import types to maintain type safety
import type {
  RequestConfiguration,
} from 'react-native-google-mobile-ads';

// Only lazy load TrackingTransparency since it's platform-specific
let TrackingTransparency: any;

// Simplified module loader that only loads platform-specific modules
const loadAdModules = async () => {
  if (Platform.OS === 'ios' && !TrackingTransparency) {
    TrackingTransparency = await import('expo-tracking-transparency');
  }
};

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

// Function to get ad unit IDs with fallback to test IDs
const getAdUnitIds = (): AdUnitIds => {
  return {
    banner: {
      android: environment.production ? environment.adBannerAndroid || TestIds.BANNER : TestIds.BANNER,
      ios: environment.production ? environment.adBannerIos || TestIds.BANNER : TestIds.BANNER,
    },
    interstitial: {
      android: environment.production ? environment.adInterstitialAndroid || TestIds.INTERSTITIAL : TestIds.INTERSTITIAL,
      ios: environment.production ? environment.adInterstitialIos || TestIds.INTERSTITIAL : TestIds.INTERSTITIAL,
    },
    rewarded: {
      android: environment.production ? environment.adRewardedAndroid || TestIds.REWARDED : TestIds.REWARDED,
      ios: environment.production ? environment.adRewardedIos || TestIds.REWARDED : TestIds.REWARDED,
    },
    appOpen: {
      android: environment.production ? environment.adAppOpenAndroid || TestIds.APP_OPEN : TestIds.APP_OPEN,
      ios: environment.production ? environment.adAppOpenIos || TestIds.APP_OPEN : TestIds.APP_OPEN,
    },
    native: {
      android: environment.production ? environment.adNativeAndroid || TestIds.NATIVE : TestIds.NATIVE,
      ios: environment.production ? environment.adNativeIos || TestIds.NATIVE : TestIds.NATIVE,
    },
  };
};

// Initialize with empty values, will be populated in getAdUnitId
let adUnitIds: AdUnitIds;

// Get the correct ad unit ID based on platform
const getAdUnitId = (adType: keyof AdUnitIds): string => {
  // Initialize adUnitIds if not already done
  if (!adUnitIds) {
    adUnitIds = getAdUnitIds();
  }
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
const loadAppOpenAd = async (): Promise<() => void> => {
  // Ensure ad modules are loaded
  try {
    await loadAdModules();
  } catch (error) {
    console.error('Error loading ad modules:', error);
    return () => { }; // Return empty function on error
  }

  // Don't try to load if already loading
  if (isAppOpenAdLoading) {
    console.log('App open ad is already loading, skipping duplicate load');
    return () => { };
  }

  console.log('Starting to load app open ad');
  isAppOpenAdLoading = true;
  isAppOpenAdLoaded = false;

  try {
    // Clean up previous ad instance if it exists
    if (appOpenAd) {
      appOpenAd = null;
    }

    const adUnitId = getAdUnitId('appOpen');
    console.log('Using app open ad unit ID:', adUnitId);

    appOpenAd = AppOpenAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    // Define unsubscribe functions with default empty functions
    let unsubscribeLoaded = () => { };
    let unsubscribeClosed = () => { };
    let unsubscribeError = () => { };

    try {
      unsubscribeLoaded = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('App open ad loaded successfully');
        appOpenAdLoadTime = Date.now();
        isAppOpenAdLoaded = true;
        isAppOpenAdLoading = false;
      });

      unsubscribeClosed = appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('App open ad closed');
        isAppOpenAdLoaded = false;
        // Reload the ad for next time after a short delay
        setTimeout(() => {
          loadAppOpenAd();
        }, 1000);
      });

      unsubscribeError = appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
        console.error('App open ad error:', error);
        appOpenAd = null;
        isAppOpenAdLoaded = false;
        isAppOpenAdLoading = false;

        // Retry loading after error with a delay
        setTimeout(() => {
          loadAppOpenAd();
        }, 5000); // Wait 5 seconds before retry
      });
    } catch (eventError) {
      console.error('Error setting up ad event listeners:', eventError);
      isAppOpenAdLoading = false;
      return () => { }; // Return empty function on error
    }

    // Start loading with error handling
    try {
      console.log('Calling load() on app open ad');
      appOpenAd.load();
    } catch (loadError) {
      console.error('Error initiating app open ad load:', loadError);
      isAppOpenAdLoading = false;
    }

    // Return a cleanup function that handles potential errors
    return () => {
      try {
        if (typeof unsubscribeLoaded === 'function') unsubscribeLoaded();
        if (typeof unsubscribeClosed === 'function') unsubscribeClosed();
        if (typeof unsubscribeError === 'function') unsubscribeError();
      } catch (cleanupError) {
        console.error('Error during ad event listener cleanup:', cleanupError);
      }
    };
  } catch (error) {
    console.error('Error setting up app open ad:', error);
    isAppOpenAdLoading = false;
    return () => { }; // Return empty function on error
  }
};

// Show an app open ad
const showAppOpenAd = async (): Promise<boolean> => {
  // Ensure ad modules are loaded
  await loadAdModules();

  console.log('Attempting to show app open ad');
  console.log('Is app open ad available?', isAppOpenAdAvailable());

  if (!isAppOpenAdAvailable()) {
    console.log('App open ad not available or not loaded yet');

    // If not already loading, start loading a new one
    if (!isAppOpenAdLoading) {
      console.log('Starting to load a new app open ad');
      await loadAppOpenAd();
    }

    return false;
  }

  try {
    if (appOpenAd && isAppOpenAdLoaded) {
      console.log('Showing app open ad now');
      await appOpenAd.show();
      console.log('App open ad shown successfully');
      return true;
    } else {
      console.log('App open ad not fully loaded yet');
      return false;
    }
  } catch (error) {
    console.error('Error showing app open ad:', error);
    // Reset state and try to load a new ad
    isAppOpenAdLoaded = false;
    await loadAppOpenAd();
    return false;
  }
};

// Interstitial ad management
let interstitialAd: InterstitialAd | null = null;

const loadInterstitialAd = async (): Promise<() => void> => {
  // Ensure ad modules are loaded
  try {
    await loadAdModules();
  } catch (error) {
    console.error('Error loading ad modules for interstitial ad:', error);
    return () => { };
  }

  try {
    const adUnitId = getAdUnitId('interstitial');

    interstitialAd = InterstitialAd.createForAdRequest(adUnitId);

    let unsubscribeLoaded = () => { };
    let unsubscribeClosed = () => { };
    let unsubscribeError = () => { };

    try {
      unsubscribeLoaded = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('Interstitial ad loaded');
      });

      unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('Interstitial ad closed');
        try {
          interstitialAd?.load();
        } catch (loadError) {
          console.error('Error reloading interstitial ad after close:', loadError);
        }
      });

      unsubscribeError = interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
        console.error('Interstitial ad error:', error);
      });
    } catch (eventError) {
      console.error('Error setting up interstitial ad event listeners:', eventError);
      return () => { };
    }

    // Start loading with error handling
    try {
      console.log('Calling load() on interstitial ad');
      interstitialAd.load();
    } catch (loadError) {
      console.error('Error initiating interstitial ad load:', loadError);
    }

    // Return a cleanup function that handles potential errors
    return () => {
      try {
        if (typeof unsubscribeLoaded === 'function') unsubscribeLoaded();
        if (typeof unsubscribeClosed === 'function') unsubscribeClosed();
        if (typeof unsubscribeError === 'function') unsubscribeError();
      } catch (cleanupError) {
        console.error('Error during interstitial ad event listener cleanup:', cleanupError);
      }
    };
  } catch (error) {
    console.error('Error setting up interstitial ad:', error);
    return () => { }; // Return empty function on error
  }
};

const showInterstitialAd = async (): Promise<boolean> => {
  // Ensure ad modules are loaded
  await loadAdModules();

  if (!interstitialAd) {
    console.log('Interstitial ad not loaded yet');
    await loadInterstitialAd();
    return false;
  }

  if (!interstitialAd.loaded) {
    console.log('Interstitial ad still loading');
    return false;
  }

  try {
    await interstitialAd.show();
    return true;
  } catch (error) {
    console.error('Error showing interstitial ad:', error);
    // Try to reload for next time
    await loadInterstitialAd();
    return false;
  }
};

// Rewarded ad management
let rewardedAd: RewardedAd | null = null;
let isRewardedAdLoading = false;

const loadRewardedAd = async (): Promise<() => void> => {
  // Ensure ad modules are loaded
  try {
    await loadAdModules();
  } catch (error) {
    console.error('Error loading ad modules for rewarded ad:', error);
    return () => { }; // Return empty function on error
  }

  if (isRewardedAdLoading && rewardedAd && rewardedAd.loaded) {
    console.log('Rewarded ad: Already loaded and ready.');
    return () => { }; // No new listeners to cleanup if ad is already loaded
  }

  if (isRewardedAdLoading) {
    console.log('Rewarded ad: Already in the process of loading.');
    return () => { }; // Don't attach new listeners or create new ad object if already loading
  }

  console.log('Rewarded ad: Attempting to load a new ad...');
  isRewardedAdLoading = true;

  try {
    // Create a new ad instance.
    // react-native-google-mobile-ads recommends creating a new instance for each load.
    const adUnitId = getAdUnitId('rewarded');

    rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    console.log(`Rewarded ad: Created new instance for unit ID: ${adUnitId}`);

    // Define unsubscribe functions with default empty functions
    let unsubscribeLoaded = () => { };
    let unsubscribeLoadError = () => { };

    try {
      // Listener for when the ad is loaded successfully
      unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('Rewarded ad: Loaded successfully (event listener in loadRewardedAd).');
        isRewardedAdLoading = false;
      });

      // Listener for errors specifically during the ad loading process
      unsubscribeLoadError = rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
        console.error(`Rewarded ad: Load-time error for ad unit ${adUnitId} (event listener in loadRewardedAd):`, error);
        isRewardedAdLoading = false;

        // Clean up these specific listeners as this ad instance failed to load
        try {
          if (typeof unsubscribeLoaded === 'function') unsubscribeLoaded();
          if (typeof unsubscribeLoadError === 'function') unsubscribeLoadError();
        } catch (cleanupError) {
          console.error('Error cleaning up rewarded ad listeners after error:', cleanupError);
        }

        // Retry loading after a delay.
        console.log(`Rewarded ad: Scheduling retry load for ${adUnitId} in 7 seconds due to load error.`);
        setTimeout(() => {
          if (!isRewardedAdLoading) { // Check flag again before retrying
            console.log(`Rewarded ad: Retrying load for ${adUnitId} after previous load-time error (7s passed).`);
            loadRewardedAd(); // This will call the main loadRewardedAd function again
          } else {
            console.log(`Rewarded ad: Skipping retry load for ${adUnitId} as another load is already in progress.`);
          }
        }, 7000); // Retry after 7 seconds
      });
    } catch (eventError) {
      console.error('Error setting up rewarded ad event listeners:', eventError);
      isRewardedAdLoading = false;
      return () => { }; // Return empty function on error
    }

    // Start loading the ad
    try {
      console.log(`Rewarded ad: Calling .load() on new instance for unit ID: ${adUnitId}.`);
      rewardedAd.load();
    } catch (loadCatchError) {
      console.error('Rewarded ad: Critical error during .load() call (in loadRewardedAd):', loadCatchError);
      isRewardedAdLoading = false;

      // Clean up listeners if .load() itself throws an immediate error
      try {
        if (typeof unsubscribeLoaded === 'function') unsubscribeLoaded();
        if (typeof unsubscribeLoadError === 'function') unsubscribeLoadError();
      } catch (cleanupError) {
        console.error('Error cleaning up rewarded ad listeners after load error:', cleanupError);
      }

      return () => { }; // Return an empty cleanup
    }

    // Return a cleanup function for these load-time listeners.
    return () => {
      try {
        console.log('Rewarded ad: Cleaning up load-time listeners (from loadRewardedAd).');
        if (typeof unsubscribeLoaded === 'function') unsubscribeLoaded();
        if (typeof unsubscribeLoadError === 'function') unsubscribeLoadError();
      } catch (cleanupError) {
        console.error('Error during rewarded ad event listener cleanup:', cleanupError);
      }
    };
  } catch (error) {
    console.error('Error setting up rewarded ad:', error);
    isRewardedAdLoading = false;
    return () => { }; // Return empty function on error
  }
};

// Define a return type for showing rewarded ads
export interface ShowRewardedAdResult {
  shown: boolean;
  rewardEarned: boolean;
  error?: any; // Optional error details
}

const showRewardedAd = async (): Promise<ShowRewardedAdResult> => {
  // Ensure ad modules are loaded
  await loadAdModules();

  if (!rewardedAd || !rewardedAd.loaded) {
    console.log('Rewarded ad not available or not loaded yet.');
    // Attempt to load an ad for the next opportunity if not already loading
    if (!isRewardedAdLoading) {
      await loadRewardedAd();
    }
    return { shown: false, rewardEarned: false };
  }

  // Keep a reference to the current ad instance for the listeners
  const currentRewardedAd = rewardedAd;

  return new Promise(async (resolve) => {
    let earnedReward = false;
    // let rewardDetails: { type: string; amount: number } | null = null; // Store reward details

    const unsubscribeEarned = currentRewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log('User earned reward in showRewardedAd:', reward);
        earnedReward = true;
        // rewardDetails = reward; // Capture reward details
      }
    );

    const unsubscribeClosed = currentRewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Rewarded ad closed by user.');
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
      resolve({ shown: true, rewardEarned: earnedReward });

      // It's important to load a new ad for the next time AFTER this one is closed
      // and all its event listeners are cleaned up.
      setTimeout(() => {
        loadRewardedAd();
      }, 500);
    });

    const unsubscribeError = currentRewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Error showing or during rewarded ad:', error);
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
      resolve({ shown: false, rewardEarned: false, error: error });

      setTimeout(() => {
        loadRewardedAd();
      }, 1000);
    });

    try {
      console.log('Attempting to show rewarded ad from adService...');
      await currentRewardedAd.show();
      console.log('Rewarded ad presented.');
      // Now we wait for EARNED_REWARD or CLOSED events.
    } catch (showError) {
      console.error('Error directly from rewardedAd.show():', showError);
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
      resolve({ shown: false, rewardEarned: false, error: showError });

      setTimeout(() => {
        loadRewardedAd();
      }, 1000);
    }
  });
};

/**
 * Initialize ads with proper consent handling
 * This follows the latest Google Mobile Ads SDK recommendations
 * with a fallback for misconfigured consent forms
 */
const initializeAds = async (): Promise<void> => {
  try {
    // Lazy load the ad modules
    await loadAdModules();

    // Request tracking permission on iOS
    if (Platform.OS === 'ios' && TrackingTransparency) {
      // Wait a bit for app to properly initialize
      await new Promise(resolve => setTimeout(resolve, 200));

      // Request tracking authorization
      const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
      console.log('Tracking permission status:', status);
    }

    // Initialize the Mobile Ads SDK directly first to avoid consent form errors
    // when the AdMob account isn't properly configured
    await MobileAds().initialize();

    console.log('Mobile Ads SDK initialized successfully');


    // Try to handle consent if possible, but don't block ad loading if it fails
    try {
      // Configure the Mobile Ads SDK with appropriate settings
      await MobileAds().setRequestConfiguration({
        // Set max ad content rating
        maxAdContentRating: MaxAdContentRating.PG,
        // Specify if you want to request ads for children
        tagForChildDirectedTreatment: false,
        // Specify if you want to request ads for users under the age of consent
        tagForUnderAgeOfConsent: false,
      } as RequestConfiguration);

      // Skip consent form handling completely until you configure it in AdMob console

      console.log('Skipping consent form handling - configure forms in AdMob console first');


      // For reference, here's how to implement consent when you have forms configured:
      /*
      try {
        const consentInfo = await AdsConsent.requestInfoUpdate({
          debugGeography: environment.production
            ? AdsConsentDebugGeography.DISABLED
            : AdsConsentDebugGeography.EEA,
          testDeviceIdentifiers: [], // Add test device IDs here if needed
        });

        if (consentInfo.isConsentFormAvailable &&
            (consentInfo.status === AdsConsentStatus.REQUIRED ||
             consentInfo.status === AdsConsentStatus.UNKNOWN)) {
          const formStatus = await AdsConsent.showForm();
          console.log('Consent form status:', formStatus);
        }
      } catch (consentError) {
        console.error('Error requesting consent information:', consentError);
      }
      */
    } catch (configError) {

      console.error('Error configuring Mobile Ads SDK:', configError);

      // Continue without configuration
    }

    // Load ads with a slight delay to ensure SDK is fully initialized
    await new Promise(resolve => setTimeout(resolve, 500));

    // Preload only essential ad types to reduce memory usage
    loadAppOpenAd();

    // Only preload interstitial and rewarded ads if needed
    if (environment.preloadAllAdTypes) {
      loadInterstitialAd();
      loadRewardedAd();
    }

    // Set up app state change listener for app open ads
    // Use a variable to track if we're coming from background
    let appStateChangeListener: any = null;
    let lastAppState = AppState.currentState;

    // Remove any existing listeners first to prevent duplicates
    try {
      // @ts-ignore - TypeScript doesn't know about the remove method
      AppState.removeEventListener('change', appStateChangeListener);
    } catch (error) {
      // Ignore errors when removing non-existent listeners
    }

    // Add new listener
    appStateChangeListener = (nextAppState: AppStateStatus) => {
      // Only show app open ads when coming from background to foreground
      if (
        (lastAppState === 'background' || lastAppState === 'inactive') &&
        nextAppState === 'active'
      ) {
        // Check with adManager if we should show an app open ad
        // This adds an extra layer of frequency capping
        const adManager = require('./adManager').adManager;

        if (adManager.canShowAppOpenAd()) {
          // Don't show immediately, give a small delay
          setTimeout(() => {
            if (isAppOpenAdAvailable()) {
              adManager.showAppOpenAd();
            } else {
              loadAppOpenAd();
            }
          }, 1000);
        }
      }

      // Update last state
      lastAppState = nextAppState;
    };

    AppState.addEventListener('change', appStateChangeListener);
  } catch (error) {
    console.error('Failed to initialize Mobile Ads SDK:', error);


    // Try to recover by loading ads anyway with minimal initialization
    try {
      // Initialize with default settings and no consent
      await MobileAds().initialize();

      // Only load essential ads in recovery mode
      await loadAppOpenAd();
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
 * Note: This will return UNKNOWN until you configure consent forms in AdMob console
 */
const getConsentStatus = async (): Promise<any> => {
  console.log('Consent forms not configured in AdMob console - returning UNKNOWN status');
  return AdsConsentStatus?.UNKNOWN || 'UNKNOWN';
};

/**
 * Show the consent form manually
 * Note: This will not work until you configure consent forms in AdMob console
 */
const showConsentForm = async (): Promise<boolean> => {
  console.log('Consent forms not configured in AdMob console - cannot show form');
  return false;
};

/**
 * Reset the consent information
 * Note: This is a placeholder until you configure consent forms in AdMob console
 */
const resetConsent = async (): Promise<void> => {
  console.log('Consent forms not configured in AdMob console - cannot reset consent');
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
