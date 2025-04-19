// This file is kept for backward compatibility but is no longer used
// Environment variables are now accessed via process.env.EXPO_PUBLIC_*
// See expo-env.d.ts for the type definitions

// This module declaration is kept for backward compatibility
declare module '@env' {
  // These exports are no longer used
  export const API_URL: string;
  export const ONESIGNAL_APP_ID: string;
  export const GOOGLE_WEB_CLIENT_ID: string;
  export const GOOGLE_IOS_CLIENT_ID: string;
  export const GOOGLE_ANDROID_CLIENT_ID: string;
  export const APP_STORE_ID: string;
  export const PLAY_STORE_ID: string;
  export const SUPPORT_EMAIL: string;
  export const PRIVACY_POLICY_URL: string;
  export const TERMS_URL: string;
}
