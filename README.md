# Checkhira

A mobile application for managing work entries and payments.

## Features

- User authentication (email, phone, Google)
- Work entry management
- Payment tracking
- Offline support
- Multi-language support
- Push notifications

## Tech Stack

- React Native
- Expo SDK 52
- TypeScript
- NativeWind (TailwindCSS)
- Expo Router
- OneSignal for push notifications

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v10 or higher)
- Expo CLI

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/checkhira.git
   cd checkhira
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Environment Setup

The app uses environment variables for configuration. Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

Then edit the `.env` file with your actual values. The app uses different environment configurations based on the build profile:

- Development: `npm start` or `npm run ios`/`npm run android`
- Preview: `npm run build:preview`
- Production: `npm run build:prod`

### Environment Variables

The following environment variables are required:

#### API Configuration
- `EXPO_PUBLIC_API_URL`: The URL of your API

#### OneSignal Configuration
- `EXPO_PUBLIC_ONESIGNAL_APP_ID`: Your OneSignal App ID

#### Google Auth Configuration
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`: Google Web Client ID
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`: Google iOS Client ID
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`: Google Android Client ID
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID_NUMBER`: Google iOS Client ID number (without the prefix)

#### Firebase Configuration
- `EXPO_PUBLIC_FIREBASE_API_KEY`: Firebase API Key
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase Auth Domain
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`: Firebase Project ID
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase Storage Bucket
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase Messaging Sender ID
- `EXPO_PUBLIC_FIREBASE_APP_ID`: Firebase App ID
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`: Firebase Measurement ID

#### AdMob Configuration
- `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID`: AdMob Android App ID
- `EXPO_PUBLIC_ADMOB_IOS_APP_ID`: AdMob iOS App ID
- `EXPO_PUBLIC_AD_BANNER_ANDROID`: AdMob Banner Ad Unit ID for Android
- `EXPO_PUBLIC_AD_BANNER_IOS`: AdMob Banner Ad Unit ID for iOS
- `EXPO_PUBLIC_AD_INTERSTITIAL_ANDROID`: AdMob Interstitial Ad Unit ID for Android
- `EXPO_PUBLIC_AD_INTERSTITIAL_IOS`: AdMob Interstitial Ad Unit ID for iOS
- `EXPO_PUBLIC_AD_REWARDED_ANDROID`: AdMob Rewarded Ad Unit ID for Android
- `EXPO_PUBLIC_AD_REWARDED_IOS`: AdMob Rewarded Ad Unit ID for iOS
- `EXPO_PUBLIC_AD_APP_OPEN_ANDROID`: AdMob App Open Ad Unit ID for Android
- `EXPO_PUBLIC_AD_APP_OPEN_IOS`: AdMob App Open Ad Unit ID for iOS
- `EXPO_PUBLIC_AD_NATIVE_ANDROID`: AdMob Native Ad Unit ID for Android
- `EXPO_PUBLIC_AD_NATIVE_IOS`: AdMob Native Ad Unit ID for iOS

### EAS Secrets

For production builds with EAS, you need to set up secrets. Use the following command to set secrets:

```bash
eas secret:create --scope project --name PROD_API_URL --value "https://api.example.com"
```

Repeat for all environment variables needed in your `eas.json` file.

## Building for Production

Before building for production, make sure you have:

1. Set up all environment variables in `.env` file
2. Set up all EAS secrets for production
3. Updated the app version in `app.json`
4. Configured Firebase for production
5. Configured AdMob for production
6. Set up code signing for Expo Updates

### Android

To build an Android App Bundle for Google Play Store:

```bash
npm run build:prod
```

This will create an AAB file that you can upload to the Google Play Console.

### iOS

To build an iOS IPA for the App Store:

```bash
npm run build:prod
```

This will create an IPA file that you can upload to App Store Connect.

### Performance Optimizations

The production build includes the following optimizations:

1. Hermes JavaScript engine for better performance
2. Proguard for Android to reduce APK size
3. Minification and tree-shaking of JavaScript code
4. Image optimization
5. Firebase performance monitoring

### Error Handling

The production build includes comprehensive error handling:

1. Global error boundary to catch and report React errors
2. Firebase Crashlytics integration for crash reporting
3. Custom error logging to backend
4. Graceful degradation for network errors

## Deployment

The app uses EAS (Expo Application Services) for building and deploying:

- Development: `npm run build:dev`
- Preview: `npm run build:preview`
- Production: `npm run build:prod`

## Code Signing for Updates

The app uses code signing for Expo Updates to ensure security. The following scripts are available to manage code signing:

- `npm run codesign:setup` - Interactive menu for code signing setup
- `npm run codesign:generate` - Generate new code signing certificates
- `npm run codesign:local` - Configure app.json for local development with code signing
- `npm run codesign:eas` - Configure app.json for EAS builds (disables code signing)

### Important Notes

- Code signing certificates are stored in `certs/production/`
- Private keys are stored in `keys/production/`
- These files should not be committed to version control
- Before building with EAS, run `npm run codesign:eas` to avoid certificate path errors
- For local development with updates, run `npm run codesign:local`

## Project Structure

```
checkhira/
├── app/                  # Expo Router app directory
│   ├── (tabs)/           # Tab navigation
│   ├── auth/             # Authentication screens
│   ├── _layout.tsx       # Root layout
│   └── ...
├── assets/               # Static assets
├── components/           # Reusable components
├── config/               # Configuration files
├── constants/            # Constants and theme
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── services/             # API and other services
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── app.json              # Expo configuration
├── eas.json              # EAS configuration
└── package.json          # Dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [NativeWind](https://www.nativewind.dev/)
