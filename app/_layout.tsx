import '../global.css';

import { Stack } from 'expo-router';
import { ToastProvider } from '../contexts/ToastContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import { AuthProvider } from '../contexts/AuthContext';
import { environment } from '~/config/environment';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';
import { ratingService } from '../services/ratingService';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { NetworkProvider, useNetwork } from '../contexts/NetworkContext';
import { OfflineScreen } from '../components/OfflineScreen';
import { RatingProvider } from '../contexts/RatingContext';
import { useEffect } from 'react';
import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';
import { analyticsService } from '../utils/analytics';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Wrapper component to use network context
function NetworkAwareLayout({ children }: { children: React.ReactNode }) {
  const { isOnline } = useNetwork();

  // Show offline screen when not connected
  if (!isOnline) {
    return <OfflineScreen />;
  }

  return <>{children}</>;
}

function RootLayoutNav() {
  const { t } = useLanguage();

  // Log screen view for analytics
  useEffect(() => {
    analyticsService.logEvent('screen_view', {
      screen_name: 'Root_Navigation',
      screen_class: 'RootLayoutNav'
    });
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth/google-login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/phone-login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/email-login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/password" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register-email" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register-password" options={{ headerShown: false }} />
      <Stack.Screen name="auth/update-profile" options={{ headerShown: false }} />
      <Stack.Screen name="payments/add" options={{ title: t('addPayment') }} />
      <Stack.Screen name="payments/[id]/edit" options={{ title: t('editPayment') }} />
      <Stack.Screen name="work/add" options={{ title: t('addWorkEntry') }} />
      <Stack.Screen name="work/[id]/edit" options={{ title: t('editWorkEntry') }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="account/edit-profile" options={{ title: t('editProfile') }} />
      <Stack.Screen name="account/language" options={{ title: t('languageSettings') }} />
      <Stack.Screen name="account/theme" options={{ title: t('themeSettings') }} />
      <Stack.Screen name="account/about" options={{ title: t('aboutApp') }} />
      <Stack.Screen name="account/default-prices" options={{ title: t('defaultPrices') }} />
    </Stack>
  );
}

export default function RootLayout() {
  // Initialize Firebase Analytics
  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        if (Platform.OS !== 'web') {
          await analytics().setAnalyticsCollectionEnabled(environment.production);

          if (!environment.production) {
            console.log('Firebase Analytics initialized in development mode');
          }
        }
      } catch (error) {
        console.error('Failed to initialize Firebase Analytics:', error);
      }
    };

    initializeAnalytics();
  }, []);

  useEffect(() => {
    const initializeOneSignal = async () => {
      const isDevMode = !environment.production;
      const oneSignalAppId = environment.oneSignalAppId;

      if (!isDevMode && oneSignalAppId) {
        try {
          // Set log level only in development
          if (isDevMode) {
            OneSignal.Debug.setLogLevel(LogLevel.Verbose);
          }

          OneSignal.initialize(oneSignalAppId);
          const permission = await OneSignal.Notifications.requestPermission(true);

          // Log permission status only in development
          if (isDevMode) {
            console.log('OneSignal permission status:', permission);
          }
        } catch (error) {
          console.error('Failed to initialize OneSignal:', error);
        }
      }
    };

    initializeOneSignal();

    //google login configare
    GoogleSignin.configure({
      iosClientId: '195151324772-4gc4nhb0ou80sij272shuaa512irgap8.apps.googleusercontent.com',
      webClientId: '195151324772-tpq4g2ctsltd8gd1on3e3nt3vlgbi33c.apps.googleusercontent.com',
      profileImageSize: 150,
      offlineAccess: true,
      scopes: ['profile', 'email']
    });
  }, []);

  const checkAppUpdates = async () => {
    if (!environment.production) return;

    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        try {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            'Update Ready',
            'A new update has been downloaded. Restart now to apply it?',
            [
              {
                text: 'Later',
                style: 'cancel',
              },
              {
                text: 'Restart',
                onPress: async () => {
                  try {
                    await Updates.reloadAsync();
                  } catch (error) {
                    console.error('Failed to reload app:', error);
                    Alert.alert(
                      'Restart Failed',
                      'Please manually restart the app to apply the update.'
                    );
                  }
                },
              },
            ]
          );
        } catch (error) {
          console.error('Failed to fetch update:', error);
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  useEffect(() => {
    if (environment.production && Updates.isEmbeddedLaunch) {
      checkAppUpdates();
    }
  }, []);

  const AppRatingManager = () => {
    const { t } = useLanguage();

    useEffect(() => {
      const initializeAppRating = async () => {
        await ratingService.incrementAppUsage();
        await ratingService.promptForRating({
          enjoyingApp: t('enjoyingApp'),
          rateExperience: t('rateExperience'),
          notNow: t('notNow'),
          rateNow: t('rateNow')
        });
      };

      initializeAppRating();
    }, [t]);

    return null;
  };

  // Notification initialization is now handled in NotificationContext

  return (
    <LanguageProvider>
      <SafeAreaProvider>
        <ErrorBoundary>
          <RatingProvider>
            <ToastProvider>
              <AuthProvider>
                <NotificationProvider>
                  <SettingsProvider>
                    <NetworkProvider>
                      <NetworkAwareLayout>
                        <AppRatingManager />
                        <RootLayoutNav />
                      </NetworkAwareLayout>
                    </NetworkProvider>
                  </SettingsProvider>
                </NotificationProvider>
              </AuthProvider>
            </ToastProvider>
          </RatingProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </LanguageProvider>
  );
}
