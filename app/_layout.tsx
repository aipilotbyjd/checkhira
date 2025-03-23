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

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
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
  }, []);

  const checkAppUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          'Update Available',
          `A new version of ${environment.appName} is available with latest features and improvements.`,
          [
            {
              text: 'Later',
              style: 'cancel',
            },
            {
              text: 'Update Now',
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  Alert.alert(
                    'Update Downloaded',
                    'The app will now restart to apply the update.',
                    [
                      {
                        text: 'OK',
                        onPress: async () => {
                          await Updates.reloadAsync();
                        },
                      },
                    ]
                  );
                } catch (error) {
                  console.error('Error updating app:', error);
                  Alert.alert(
                    'Update Failed',
                    'Please check your internet connection and try again later.'
                  );
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error checking updates:', error);
    }
  };

  useEffect(() => {
    console.log('Updates.isEmbeddedLaunch', Updates.isEmbeddedLaunch);

    if (environment.production && Updates.isEmbeddedLaunch) {
      checkAppUpdates();
    }
  }, []);

  useEffect(() => {
    const initializeAppRating = async () => {
      await ratingService.incrementAppUsage();
      await ratingService.promptForRating();
    };

    initializeAppRating();
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <NotificationProvider>
                <SettingsProvider>
                  <AnalyticsProvider>
                    <RootLayoutNav />
                  </AnalyticsProvider>
                </SettingsProvider>
              </NotificationProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
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
      <Stack.Screen name="payments/add" options={{ title: 'Add Payment' }} />
      <Stack.Screen name="payments/[id]/edit" options={{ title: 'Edit Payment' }} />
      <Stack.Screen name="work/add" options={{ title: 'Add Work Entry' }} />
      <Stack.Screen name="work/[id]/edit" options={{ title: 'Edit Work Entry' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="account/edit-profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="account/terms" options={{ title: 'Terms & Conditions' }} />
      <Stack.Screen name="account/privacy" options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="account/about" options={{ title: 'About App' }} />
      <Stack.Screen name="account/default-prices" options={{ title: 'Default Prices' }} />
    </Stack>
  );
}
