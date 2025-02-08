import '../global.css';

import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import { useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { environment } from '~/config/environment';
import * as Updates from 'expo-updates';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
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

    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: environment.webClientId,
      iosClientId: environment.iosClientId,
      offlineAccess: true,
    });

    initializeOneSignal();
  }, []);

  // useEffect(() => {
  //   const checkAppUpdates = async () => {
  //     try {
  //       const update = await Updates.checkForUpdateAsync();
  //       if (update.isAvailable) {
  //         await Updates.fetchUpdateAsync();
  //         // NOTIFY USER HERE
  //         Updates.reloadAsync();
  //       }
  //     } catch (e) {
  //       // HANDLE ERROR HERE
  //       console.error('Error checking updates:', e);
  //     }
  //   };

  //   console.log('Updates.isEmbeddedLaunch', Updates.isEmbeddedLaunch);

  //   if (environment.production && Updates.isEmbeddedLaunch) {
  //     checkAppUpdates();
  //   }
  // }, []);

  return (
    <NotificationProvider>
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth/login" options={{ headerShown: false }} />
              <Stack.Screen name="auth/email-login" options={{ headerShown: false }} />
              <Stack.Screen name="auth/register" options={{ headerShown: false }} />
              <Stack.Screen name="auth/verify-otp" options={{ headerShown: false }} />
              <Stack.Screen name="auth/phone-login" options={{ headerShown: false }} />
              <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
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
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
