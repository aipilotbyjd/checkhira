import { Environment } from './environment';

/**
 * Production environment configuration
 * These are fallback values that will be used if not provided in .env file
 * or app.json extra section
 *
 * IMPORTANT: Do not hardcode sensitive values here. Use environment variables instead.
 */
export const productionEnvironment: Environment = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  nodeEnv: 'production',
  production: true,
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION,
  appName: process.env.EXPO_PUBLIC_APP_NAME,
  appStoreId: process.env.EXPO_PUBLIC_APP_STORE_ID,
  playStoreId: process.env.EXPO_PUBLIC_PLAY_STORE_ID,
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL,
  privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL,
  termsUrl: process.env.EXPO_PUBLIC_TERMS_URL,
  oneSignalAppId: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID,
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  // Ad unit IDs
  adBannerAndroid: process.env.EXPO_PUBLIC_AD_BANNER_ANDROID,
  adBannerIos: process.env.EXPO_PUBLIC_AD_BANNER_IOS,
  adInterstitialAndroid: process.env.EXPO_PUBLIC_AD_INTERSTITIAL_ANDROID,
  adInterstitialIos: process.env.EXPO_PUBLIC_AD_INTERSTITIAL_IOS,
  adRewardedAndroid: process.env.EXPO_PUBLIC_AD_REWARDED_ANDROID,
  adRewardedIos: process.env.EXPO_PUBLIC_AD_REWARDED_IOS,
  adAppOpenAndroid: process.env.EXPO_PUBLIC_AD_APP_OPEN_ANDROID,
  adAppOpenIos: process.env.EXPO_PUBLIC_AD_APP_OPEN_IOS,
  adNativeAndroid: process.env.EXPO_PUBLIC_AD_NATIVE_ANDROID,
  adNativeIos: process.env.EXPO_PUBLIC_AD_NATIVE_IOS,

  // Ad configuration
  enableAdsInDevelopment: true,
  preloadAllAdTypes: true,
  websiteUrl: process.env.EXPO_PUBLIC_WEBSITE_URL,
  twitterUrl: process.env.EXPO_PUBLIC_TWITTER_URL,
  instagramUrl: process.env.EXPO_PUBLIC_INSTAGRAM_URL,
  facebookUrl: process.env.EXPO_PUBLIC_FACEBOOK_URL,
  linkedinUrl: process.env.EXPO_PUBLIC_LINKEDIN_URL,
};
