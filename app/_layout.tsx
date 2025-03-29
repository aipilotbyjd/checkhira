import '../global.css';

import { Stack } from 'expo-router';
import { ToastProvider } from '../contexts/ToastContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import { AuthProvider } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { environment } from '~/config/environment';
import * as Updates from 'expo-updates';
import { Alert, View, Text } from 'react-native';
import { ratingService } from '../services/ratingService';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function RootLayoutNav() {
  const { t } = useLanguage();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
      <Stack.Screen name="account/terms" options={{ title: t('termsAndConditions') }} />
      <Stack.Screen name="account/privacy" options={{ title: t('privacyPolicy') }} />
      <Stack.Screen name="account/language" options={{ title: t('languageSettings') }} />
      <Stack.Screen name="account/theme" options={{ title: t('themeSettings') }} />
      <Stack.Screen name="account/about" options={{ title: t('aboutApp') }} />
      <Stack.Screen name="account/default-prices" options={{ title: t('defaultPrices') }} />
    </Stack>
  );
}

export default function RootLayout() {
  const { t } = useLanguage();

  useEffect(() => {
    const initializeOneSignal = async () => {
      const isDevMode = !environment.production;
      console.log('isDevMode', isDevMode);
      const oneSignalAppId = environment.oneSignalAppId;
      console.log('oneSignalAppId', oneSignalAppId);

      if (!isDevMode && oneSignalAppId) {
        try {
          // Set log level only in development
          if (isDevMode) {
            OneSignal.Debug.setLogLevel(LogLevel.Verbose);
          }

          await OneSignal.initialize(oneSignalAppId);
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
      profileImageSize: 150
    });
  }, []);

  const checkAppUpdates = async () => {
    if (!environment.production) return;

    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          'Update Available',
          'A new version of the app is available. Would you like to update now?',
          [
            {
              text: 'Later',
              style: 'cancel',
            },
            {
              text: 'Update',
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch (error) {
                  console.error('Failed to fetch or reload update:', error);
                  Alert.alert(
                    'Update Failed',
                    'There was a problem updating the app. Please try again later.'
                  );
                }
              },
            },
          ]
        );
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

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <AuthProvider>
                <NotificationProvider>
                  <SettingsProvider>
                    <AnalyticsProvider>
                      <AppRatingManager />
                      <RootLayoutNav />
                    </AnalyticsProvider>
                  </SettingsProvider>
                </NotificationProvider>
              </AuthProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
