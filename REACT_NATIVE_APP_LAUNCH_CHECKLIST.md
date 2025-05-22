# React Native/Expo App Launch Checklist for CheckHira

This comprehensive checklist will guide you through the process of launching your CheckHira app to both the Google Play Store and Apple App Store, with specific technical recommendations based on your codebase.

## 1. Pre-launch Preparations

### Code Quality and Testing
- [ ] Run linting checks: `npm run lint`
- [ ] Fix all linting errors and warnings
- [ ] Run dependency checks: `npm run deps:check`
- [ ] Run Expo Doctor to check for configuration issues: `npm run update:check`
- [ ] Perform manual testing on multiple devices (different screen sizes)
- [ ] Test all app features in offline mode using NetInfo implementation
- [ ] Test app behavior with slow network connections (verify axios-retry is working)
- [ ] Verify deep linking functionality works correctly with your expo-router setup
- [ ] Test OneSignal push notifications with your production app ID
- [ ] Verify Firebase Analytics, Crashlytics, and Performance are working with your production Firebase project (hirabook-237dc)
- [ ] Test Google Sign-In functionality with production credentials
- [ ] Verify all API endpoints are pointing to production servers (check apiConfig.ts)

### Performance Optimization
- [ ] Verify Hermes JavaScript engine is enabled (already set in your app.json with `"jsEngine": "hermes"`)
- [ ] Confirm Proguard is enabled for Android (already set in your app.json with `"enableProguardInReleaseBuilds": true`)
- [ ] Optimize image assets in the assets folder using:
  ```bash
  npx expo-optimize
  ```
- [ ] Remove console.log statements using babel-plugin-transform-remove-console (already in your dependencies)
- [ ] Verify babel.config.js includes console removal for production:
  ```javascript
  plugins: [
    process.env.NODE_ENV === 'production' ? 'transform-remove-console' : null
  ].filter(Boolean)
  ```
- [ ] Implement code splitting for large screens using dynamic imports
- [ ] Verify app startup time is acceptable (target < 2 seconds)
- [ ] Check memory usage during extended app usage with Firebase Performance Monitoring
- [ ] Optimize JavaScript bundle size using the Metro bundler configuration
- [ ] Verify app performance on low-end devices (especially the adService implementation)
- [ ] Ensure NativeWind styles are optimized for production

### Final Code Review
- [ ] Review all TODO comments and resolve them
- [ ] Check for hardcoded values that should be environment variables (especially in constants/config.ts)
- [ ] Verify error handling is implemented throughout the app (check axios interceptors)
- [ ] Ensure all API calls have proper error handling with axios-retry configuration
- [ ] Check for memory leaks in ad components (verify all event listeners are properly unsubscribed)
- [ ] Verify all components properly clean up resources in useEffect return functions
- [ ] Review Firebase initialization to ensure analytics.isSupported() check is implemented
- [ ] Check OneSignal implementation for proper initialization and event handling

## 2. App Store Requirements

### Common Requirements (Both Stores)
- [ ] Verify app name: "CheckHira" (matches app.json name field)
- [ ] Write compelling app description (short and long versions)
- [ ] Create privacy policy URL (set in EXPO_PUBLIC_PRIVACY_POLICY_URL)
- [ ] Create terms of service URL (set in EXPO_PUBLIC_TERMS_URL)
- [ ] Prepare support email address (set in EXPO_PUBLIC_SUPPORT_EMAIL)
- [ ] Create promotional graphics using your existing assets in the assets folder
- [ ] Prepare app category selection (likely "Productivity" or "Utilities" based on app functionality)
- [ ] List all permissions used in your app:
  - Android: VIBRATE, POST_NOTIFICATIONS, AD_ID (from app.json)
  - iOS: Tracking transparency, Push notifications (from app.json)
- [ ] Prepare release notes for version 1.0.1 (current version in app.json)

### Google Play Store Requirements
- [ ] Create Google Play Developer account ($25 one-time fee)
- [ ] Prepare content rating questionnaire answers (consider ad content)
- [ ] Create store listing with feature graphic (1024x500px)
- [ ] Verify high-resolution app icon (512x512px) - use assets/icon.png
- [ ] Create at least 2-8 screenshots for different devices
  - Phone: 16:9 aspect ratio (minimum 320px width)
  - Tablet: 16:9 aspect ratio (minimum 1080px width)
- [ ] Prepare app bundle (AAB) file using:
  ```bash
  npm run build:prod
  ```
- [ ] Complete target audience and content section
- [ ] Set up pricing and distribution (countries, free/paid)
- [ ] Configure AdMob settings in Play Console with your AdMob app ID: ca-app-pub-6156225952846626~9565432583
- [ ] Complete Data Safety section including:
  - Analytics data collection (Firebase)
  - Advertising data (AdMob)
  - User content (if applicable)
  - Device information
  - OneSignal data collection

### Apple App Store Requirements
- [ ] Create Apple Developer account ($99/year)
- [ ] Prepare App Store icon (1024x1024px) - use a higher resolution version of assets/icon.png
- [ ] Create App Store listing with screenshots
  - iPhone: 6.5" display (1284x2778px)
  - iPhone: 5.5" display (1242x2208px)
  - iPad: 12.9" display (2048x2732px) if you support tablets (supportsTablet: true in app.json)
- [ ] Prepare app preview videos (optional but recommended)
- [ ] Complete App Privacy information including:
  - Data used to track you (AdMob)
  - Data linked to you (Analytics, User content)
  - Data not linked to you (Diagnostics)
- [ ] Prepare for App Review Guidelines compliance (especially for ads implementation)
- [ ] Set up App Store Connect record with bundle ID: com.jaydeepdhrangiya.checkhira
- [ ] Configure in-app purchases (if applicable)
- [ ] Complete export compliance information
- [ ] Verify App Tracking Transparency implementation:
  - NSUserTrackingUsageDescription is set in app.json
  - expo-tracking-transparency is properly implemented in adService.ts

## 3. Building Production-Ready Versions

### Environment Configuration
- [ ] Create production .env file with all required variables based on your config/production.ts:
  ```
  EXPO_PUBLIC_API_URL=https://your-production-api.com
  EXPO_PUBLIC_APP_VERSION=1.0.1
  EXPO_PUBLIC_APP_NAME=CheckHira
  EXPO_PUBLIC_APP_STORE_ID=your-app-store-id
  EXPO_PUBLIC_PLAY_STORE_ID=your-play-store-id
  EXPO_PUBLIC_SUPPORT_EMAIL=support@example.com
  EXPO_PUBLIC_PRIVACY_POLICY_URL=https://example.com/privacy
  EXPO_PUBLIC_TERMS_URL=https://example.com/terms
  EXPO_PUBLIC_ONESIGNAL_APP_ID=your-onesignal-app-id
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-google-ios-client-id
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-google-android-client-id
  EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAzzEmZE30Fc2WFon0BusdwdWy0xQ6YCyA
  EXPO_PUBLIC_AD_BANNER_ANDROID=your-admob-banner-id-android
  EXPO_PUBLIC_AD_BANNER_IOS=your-admob-banner-id-ios
  EXPO_PUBLIC_AD_INTERSTITIAL_ANDROID=your-admob-interstitial-id-android
  EXPO_PUBLIC_AD_INTERSTITIAL_IOS=your-admob-interstitial-id-ios
  EXPO_PUBLIC_AD_APP_OPEN_ANDROID=your-admob-app-open-id-android
  EXPO_PUBLIC_AD_APP_OPEN_IOS=your-admob-app-open-id-ios
  EXPO_PUBLIC_AD_NATIVE_ANDROID=your-admob-native-id-android
  EXPO_PUBLIC_AD_NATIVE_IOS=your-admob-native-id-ios
  ```

- [ ] Set up EAS secrets for production builds (these are already referenced in your eas.json):
  ```bash
  eas secret:create --scope project --name PROD_API_URL --value https://your-production-api.com
  eas secret:create --scope project --name PROD_ADMOB_ANDROID_APP_ID --value ca-app-pub-6156225952846626~9565432583
  eas secret:create --scope project --name PROD_ADMOB_IOS_APP_ID --value ca-app-pub-6156225952846626~9565432583
  # Repeat for all other environment variables
  ```

- [ ] Verify eas.json has all the necessary environment variables in the production profile

### Building for Android
- [ ] Verify Android package name in app.json: `com.jaydeepdhrangiya.checkhira` (already set)
- [ ] Ensure google-services.json is properly configured for the production Firebase project (hirabook-237dc)
- [ ] Create upload keystore for signing if not already done:
  ```bash
  npm run codesign:generate
  ```
- [ ] Configure EAS build with production profile:
  ```bash
  npm run build:prod
  ```
  or use the comprehensive production build script:
  ```bash
  npm run build:production
  ```
- [ ] Verify the AAB file is generated correctly
- [ ] Test the production APK on a real device before submission:
  ```bash
  npm run build:preview
  ```

### Building for iOS
- [ ] Verify iOS bundle identifier in app.json: `com.jaydeepdhrangiya.checkhira` (already set)
- [ ] Ensure GoogleService-Info.plist is properly configured for the production Firebase project
- [ ] Set up App Store Connect record for your app
- [ ] Configure certificates and provisioning profiles:
  ```bash
  npm run codesign:setup
  ```
- [ ] Verify OneSignalNotificationServiceExtension is properly configured in app.json (already set)
- [ ] Build for production:
  ```bash
  npm run build:prod
  ```
- [ ] Verify the IPA file is generated correctly
- [ ] Test the production build on a real iOS device before submission

## 4. Submission Process

### Google Play Store Submission
- [ ] Log in to Google Play Console
- [ ] Create a new app or select existing app
- [ ] Complete store listing information with your app details
- [ ] Upload AAB file to production track (generated from `npm run build:prod`)
- [ ] Add release notes for version 1.0.1
- [ ] Set up staged rollout percentage (start with 10-20%)
- [ ] Complete content rating questionnaire (consider ad content)
- [ ] Set pricing and distribution (likely free with ads based on your AdMob implementation)
- [ ] Configure app signing by Google Play (recommended)
- [ ] Verify Firebase App Distribution is properly set up (if using)
- [ ] Submit for review
- [ ] Use EAS Submit for automated submission:
  ```bash
  eas submit -p android --profile production
  ```

### Apple App Store Submission
- [ ] Log in to App Store Connect
- [ ] Create a new app or select existing app with bundle ID: com.jaydeepdhrangiya.checkhira
- [ ] Complete App Information
- [ ] Upload build through Transporter or EAS Submit:
  ```bash
  eas submit -p ios --profile production
  ```
- [ ] Add app screenshots and preview videos
- [ ] Complete App Privacy information (including AdMob, Firebase, and OneSignal data collection)
- [ ] Set pricing and availability
- [ ] Verify App Tracking Transparency implementation
- [ ] Configure app capabilities in Xcode (Push Notifications, etc.)
- [ ] Submit for review
- [ ] Prepare for potential rejection due to ads implementation (have documentation ready)

## 5. Post-Launch Considerations

### Monitoring
- [ ] Set up Firebase Crashlytics alerts for your hirabook-237dc project
- [ ] Configure Firebase Analytics dashboards to track key user actions
- [ ] Monitor app performance metrics using Firebase Performance Monitoring
- [ ] Set up API monitoring for backend services (check apiConfig.ts for endpoints)
- [ ] Create alerts for critical errors
- [ ] Monitor AdMob performance and revenue in Google AdMob dashboard
- [ ] Set up OneSignal delivery monitoring for push notifications
- [ ] Configure Expo Updates monitoring for OTA update delivery

### User Feedback
- [ ] Monitor app store reviews (consider using expo-store-review for in-app ratings)
- [ ] Set up a feedback collection system using your existing support email
- [ ] Create a process for prioritizing user-reported issues
- [ ] Establish a timeline for addressing critical bugs
- [ ] Configure in-app feedback mechanism (consider using your existing rating system)
- [ ] Monitor OneSignal notification engagement metrics

### Updates
- [ ] Plan for regular update cycle (bug fixes, new features)
- [ ] Configure Expo Updates for over-the-air updates (already set up in app.json)
- [ ] Create a hotfix process for critical issues
- [ ] Establish version numbering scheme (currently at 1.0.1)
- [ ] Use your existing release scripts:
  ```bash
  npm run release:patch  # For bug fixes (1.0.1 -> 1.0.2)
  npm run release:minor  # For new features (1.0.1 -> 1.1.0)
  npm run release:major  # For major changes (1.0.1 -> 2.0.0)
  ```
- [ ] Test OTA updates thoroughly before releasing to production

## 6. App Size Optimization

### Bundle Size Reduction
- [ ] Verify Proguard is enabled for Android (already set in app.json with `"enableProguardInReleaseBuilds": true`)
- [ ] Use dynamic imports for large libraries (especially for screens that aren't immediately needed)
- [ ] Analyze your bundle size with source-map-explorer (already in your devDependencies):
  ```bash
  npx source-map-explorer ./dist/bundle.js
  ```
- [ ] Implement code splitting for large screens/features
- [ ] Verify Hermes is enabled (already set in app.json with `"jsEngine": "hermes"`)
- [ ] Configure Metro bundler to exclude dev-only code in production:
  ```javascript
  // metro.config.js
  const { getDefaultConfig } = require('expo/metro-config');
  const config = getDefaultConfig(__dirname);

  config.transformer.minifierConfig = {
    keep_classnames: false,
    keep_fnames: false,
    mangle: {
      toplevel: true,
    },
    compress: {
      drop_console: true,
    },
  };

  module.exports = config;
  ```

### Asset Optimization
- [ ] Optimize image assets in your assets folder:
  ```bash
  npx expo-optimize
  ```
- [ ] Convert PNG images to WebP format for smaller file sizes:
  ```bash
  npx @squoosh/cli --webp auto ./assets/images/*.png
  ```
- [ ] Configure asset bundling to include only necessary files (verify your assetBundlePatterns in app.json)
- [ ] Remove unused images and assets from the assets folder
- [ ] Optimize splash screen and icon assets
- [ ] Consider using SVGs instead of PNGs where possible

### Code Cleanup
- [ ] Remove unused dependencies using your existing script:
  ```bash
  npm run deps:check
  ```
- [ ] Remove unused imports across your codebase:
  ```bash
  npx unimported
  ```
- [ ] Remove commented-out code blocks
- [ ] Optimize NativeWind styles for production
- [ ] Verify you're not importing unnecessary platform-specific code
- [ ] Use platform-specific file extensions (.ios.js, .android.js) to avoid loading unnecessary code
- [ ] Remove console.log statements in production builds
- [ ] Remove any debug or development-only code

## 7. Environment Variables for Production

- [ ] Use EAS secrets for sensitive information (already referenced in your eas.json):
  ```bash
  eas secret:create --scope project --name PROD_API_URL --value https://your-production-api.com
  ```
- [ ] Verify all environment variables are properly loaded in config/production.ts
- [ ] Ensure no sensitive information is hardcoded (especially in constants/config.ts)
- [ ] Verify your environment variables are correctly set in different build profiles in eas.json
- [ ] Configure environment variables in eas.json for production builds (already set up)
- [ ] Verify API endpoints use production URLs (check apiConfig.ts)
- [ ] Ensure Firebase configuration uses your production project (hirabook-237dc)
- [ ] Verify OneSignal is configured for production mode (already set in app.json)
- [ ] Check that AdMob is using production ad unit IDs (not test IDs)

## 8. AdMob Implementation Best Practices

### Ad Unit Configuration
- [ ] Replace test ad unit IDs with production ad unit IDs in your environment variables:
  ```
  EXPO_PUBLIC_AD_BANNER_ANDROID=ca-app-pub-6156225952846626~XXXXXXXXXX
  EXPO_PUBLIC_AD_BANNER_IOS=ca-app-pub-6156225952846626~XXXXXXXXXX
  EXPO_PUBLIC_AD_INTERSTITIAL_ANDROID=ca-app-pub-6156225952846626~XXXXXXXXXX
  EXPO_PUBLIC_AD_INTERSTITIAL_IOS=ca-app-pub-6156225952846626~XXXXXXXXXX
  EXPO_PUBLIC_AD_APP_OPEN_ANDROID=ca-app-pub-6156225952846626~XXXXXXXXXX
  EXPO_PUBLIC_AD_APP_OPEN_IOS=ca-app-pub-6156225952846626~XXXXXXXXXX
  EXPO_PUBLIC_AD_NATIVE_ANDROID=ca-app-pub-6156225952846626~XXXXXXXXXX
  EXPO_PUBLIC_AD_NATIVE_IOS=ca-app-pub-6156225952846626~XXXXXXXXXX
  ```
- [ ] Verify your AdMob app ID is correctly set in app.json: ca-app-pub-6156225952846626~9565432583
- [ ] Remove any hardcoded test ad unit IDs from your codebase
- [ ] Verify the getAdUnitId function in adService.ts is correctly returning production ad IDs

### Privacy and Compliance
- [ ] Implement proper consent management (GDPR, CCPA) - verify your adService.ts implementation
- [ ] Verify tracking permission request on iOS is working:
  ```javascript
  // This is already implemented in your adService.ts
  await TrackingTransparency.requestTrackingPermissionsAsync();
  ```
- [ ] Confirm appropriate ad content rating is set:
  ```javascript
  // This is already set in your adService.ts
  MaxAdContentRating.PG
  ```
- [ ] Ensure your privacy policy covers AdMob data collection
- [ ] Verify NSUserTrackingUsageDescription is properly set in app.json

### Ad Performance and User Experience
- [ ] Verify frequency capping for interstitial and rewarded ads in your adManager.ts
- [ ] Ensure ads are preloaded before showing them (check your adService implementation)
- [ ] Test ad loading failure handling in your components
- [ ] Test ads thoroughly in production mode with real ad units
- [ ] Follow Google's ad placement policies (especially for interstitial and app open ads)
- [ ] Verify proper ad event tracking in your components:
  ```javascript
  // Check that you're using proper event types like:
  AdEventType.LOADED
  AdEventType.ERROR
  ```
- [ ] Ensure ads don't interfere with app functionality (especially app open ads)
- [ ] Verify your AppStartAdManager.tsx implementation for app open ads
- [ ] Test BannerAdComponent.tsx on different screen sizes
- [ ] Ensure InterstitialAdComponent.tsx properly handles ad loading states
- [ ] Verify that ads are only shown when successfully fetched (per your preferences)
- [ ] Test ad implementation with network connectivity issues
- [ ] Implement fallback behavior when ads fail to load
- [ ] Optimize ad loading timing to minimize impact on app performance
- [ ] Consider implementing a "no ads" option for premium users

## 9. Additional Optimizations

### Code Quality
- [ ] Run a static code analysis tool to identify potential issues:
  ```bash
  npx eslint . --max-warnings=0
  ```
- [ ] Implement TypeScript strict mode (already enabled in tsconfig.json)
- [ ] Add unit tests for critical functionality
- [ ] Implement end-to-end testing with Detox or Maestro
- [ ] Use React.memo for components that render frequently but rarely change
- [ ] Optimize useEffect dependencies to prevent unnecessary re-renders
- [ ] Implement proper error boundaries around the app
- [ ] Remove any unused code or "dead code" paths
- [ ] Refactor large components into smaller, more manageable pieces
- [ ] Ensure consistent naming conventions throughout the codebase
- [ ] Add proper JSDoc comments to functions and components

### Performance Optimization
- [ ] Implement list virtualization for long scrolling lists (FlatList, SectionList)
- [ ] Use Image component with proper resizeMode and caching
- [ ] Implement lazy loading for screens and components
- [ ] Optimize animations to use native driver where possible:
  ```javascript
  useNativeDriver: true
  ```
- [ ] Minimize bridge traffic between JS and native code
- [ ] Use InteractionManager for expensive operations:
  ```javascript
  InteractionManager.runAfterInteractions(() => {
    // Run expensive operation after animations complete
  });
  ```
- [ ] Implement proper memoization for expensive calculations
- [ ] Use PureComponent or React.memo for pure rendering components
- [ ] Optimize Redux/state management to prevent unnecessary re-renders
- [ ] Implement proper keyboard handling and dismissal

### Network Optimization
- [ ] Implement proper API request caching
- [ ] Use HTTP/2 for API requests where possible
- [ ] Implement request batching for multiple API calls
- [ ] Optimize API response payload size
- [ ] Implement proper retry logic for failed network requests (verify axios-retry configuration)
- [ ] Use compression for API requests and responses
- [ ] Implement proper offline support with data synchronization
- [ ] Optimize image loading and caching
- [ ] Implement proper error handling for network requests
- [ ] Use proper timeout handling for API requests (verify apiConfig.ts timeout setting)
- [ ] Implement request cancellation for abandoned screens/components
- [ ] Use proper authentication token management
- [ ] Implement proper API versioning strategy

### What to Keep vs. What to Remove

#### Essential Components to Keep Safe
- [ ] Core app functionality and business logic
- [ ] Firebase configuration files (google-services.json and GoogleService-Info.plist)
- [ ] Authentication mechanisms and security features
- [ ] API service implementations (especially in services/ directory)
- [ ] Navigation structure (expo-router setup)
- [ ] State management core functionality
- [ ] Error handling and logging mechanisms
- [ ] Critical UI components and screens
- [ ] OneSignal notification handling
- [ ] AdMob implementation (adService.ts and ad components)
- [ ] Environment configuration files (but clean sensitive data)
- [ ] Assets used in the app (icons, splash screens, etc.)
- [ ] Localization files and translations

#### Safe to Remove or Optimize
- [ ] Identify and remove unused dependencies:
  ```bash
  npx depcheck
  ```
- [ ] Remove unused imports with ESLint autofix:
  ```bash
  npx eslint --fix --rule 'no-unused-vars: error' .
  ```
- [ ] Identify dead code with coverage tools:
  ```bash
  npx jest --coverage
  ```
- [ ] Remove console.log statements (using babel-plugin-transform-remove-console)
- [ ] Remove commented-out code blocks
- [ ] Remove unused components and files
- [ ] Remove unused assets and resources
- [ ] Remove unused styles and theme variables
- [ ] Remove unused API endpoints and services
- [ ] Remove unused utility functions
- [ ] Remove unused configuration options
- [ ] Remove platform-specific code for platforms you don't target
- [ ] Remove development and debugging code in production
- [ ] Remove test ad unit IDs and replace with production IDs

### Security Enhancements
- [ ] Implement proper API key management
- [ ] Use secure storage for sensitive information (expo-secure-store)
- [ ] Implement proper authentication and authorization
- [ ] Protect against common security vulnerabilities
- [ ] Implement certificate pinning for API requests
- [ ] Use HTTPS for all network requests
- [ ] Implement proper input validation
- [ ] Protect against injection attacks
- [ ] Implement proper session management
- [ ] Use the latest security patches and updates
- [ ] Implement proper error handling that doesn't expose sensitive information
- [ ] Conduct a security audit before launch

## 10. Data Backup and Protection

### Critical Data to Back Up
- [ ] Create a backup of your Firebase project configuration
- [ ] Export and securely store your signing keys and certificates:
  ```bash
  npm run codesign:generate
  ```
- [ ] Back up your Google Play and App Store developer account credentials
- [ ] Create a backup of your production .env file (store securely)
- [ ] Back up your EAS secrets:
  ```bash
  eas secret:list --scope project > eas-secrets-backup.txt
  ```
- [ ] Export and back up your OneSignal configuration
- [ ] Back up your AdMob account settings and ad unit IDs
- [ ] Create a backup of your app's assets (icons, splash screens, etc.)
- [ ] Back up your app store listings (descriptions, screenshots, etc.)
- [ ] Create a backup of your privacy policy and terms of service
- [ ] Back up your codebase to a secure repository
- [ ] Document and back up any custom configurations or settings

### Sensitive Data Protection
- [ ] Remove hardcoded API keys and secrets from the codebase
- [ ] Use environment variables for sensitive information
- [ ] Implement secure storage for user credentials (expo-secure-store)
- [ ] Encrypt sensitive data before storing locally
- [ ] Implement proper authentication token management
- [ ] Use HTTPS for all API requests
- [ ] Implement proper session management
- [ ] Protect against common security vulnerabilities
- [ ] Implement certificate pinning for API requests
- [ ] Use secure and private git repositories
- [ ] Implement proper access controls for your backend services
- [ ] Regularly audit and rotate API keys and secrets
