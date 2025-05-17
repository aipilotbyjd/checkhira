import { productionEnvironment } from './production';
import { developmentEnvironment } from './development';

/**
 * Environment configuration interface
 */
export interface Environment {
  apiUrl: string | undefined;
  nodeEnv: string;
  oneSignalAppId: string | undefined;
  production: boolean;
  appVersion: string | undefined;
  appName: string | undefined;
  appStoreId: string | undefined;
  playStoreId: string | undefined;
  supportEmail: string | undefined;
  googleWebClientId?: string | undefined;
  googleIosClientId?: string | undefined;
  googleAndroidClientId?: string | undefined;
  firebaseApiKey?: string | undefined;
  privacyPolicyUrl?: string | undefined;
  termsUrl?: string | undefined;

  // Ad unit IDs
  adBannerAndroid?: string | undefined;
  adBannerIos?: string | undefined;
  adInterstitialAndroid?: string | undefined;
  adInterstitialIos?: string | undefined;
  adRewardedAndroid?: string | undefined;
  adRewardedIos?: string | undefined;
  adAppOpenAndroid?: string | undefined;
  adAppOpenIos?: string | undefined;
  adNativeAndroid?: string | undefined;
  adNativeIos?: string | undefined;

  // Ad configuration
  enableAdsInDevelopment?: boolean;
  preloadAllAdTypes?: boolean;

  // Social media URLs
  websiteUrl?: string | undefined;
  twitterUrl?: string | undefined;
  instagramUrl?: string | undefined;
  facebookUrl?: string | undefined;
  linkedinUrl?: string | undefined;
}

/**
 * Gets the environment configuration based on NODE_ENV
 */
const getEnvironmentConfig = (): Environment => {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production';

  switch (nodeEnv) {
    case 'production':
      return productionEnvironment;
    case 'development':
    default:
      return developmentEnvironment;
  }
};

/**
 * Merges environment variables from different sources with the following priority:
 * 1. process.env.EXPO_PUBLIC_* variables (highest priority)
 * 2. Constants.expoConfig.extra values (medium priority)
 * 3. Base environment config from development/production (lowest priority)
 */
// Get the base environment configuration based on NODE_ENV
const baseEnvironment = getEnvironmentConfig();

// Merge with values from Constants.expoConfig.extra and process.env
export const environment: Environment = baseEnvironment;
