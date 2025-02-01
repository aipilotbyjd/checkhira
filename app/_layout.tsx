import '../global.css';

import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { NotificationProvider } from '../contexts/NotificationContext';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <NotificationProvider>
          <ToastProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth/login" options={{ headerShown: false }} />
              <Stack.Screen name="auth/register" options={{ headerShown: false }} />
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
        </NotificationProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
