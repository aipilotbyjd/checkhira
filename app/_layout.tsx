import '../global.css';

import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import { useEffect } from 'react';
import Constants from 'expo-constants';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  useEffect(() => {
    const initializeOneSignal = async () => {
      // Check if we're in development or production
      const isDevMode = __DEV__;
      console.log('Environment:', isDevMode ? 'Development' : 'Production');

      // Only initialize in production builds
      if (!isDevMode) {
        const oneSignalAppId =
          Constants.expoConfig?.extra?.oneSignalAppId || '9b67efd6-0e42-4f80-88c7-74b79b0efac7';

        console.log('Initializing OneSignal with App ID:', oneSignalAppId);

        if (oneSignalAppId) {
          try {
            OneSignal.Debug.setLogLevel(LogLevel.Verbose);
            OneSignal.initialize(oneSignalAppId);

            // Request notification permissions
            const permission = await OneSignal.Notifications.requestPermission(true);
            console.log('OneSignal permission status:', permission);
          } catch (error) {
            console.error('Failed to initialize OneSignal:', error);
          }
        } else {
          console.warn('OneSignal App ID not found in app.json extra params');
        }
      } else {
        console.log('OneSignal initialization skipped in development mode');
      }
    };

    initializeOneSignal();
  }, []);

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
