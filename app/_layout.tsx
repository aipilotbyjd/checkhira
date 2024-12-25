import '../global.css';

import { Stack } from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="payments/add" options={{ title: 'Add Payment' }} />
      <Stack.Screen name="payments/[id]/edit" options={{ title: 'Edit Payment' }} />
      <Stack.Screen name="work/add" options={{ title: 'Add Work Entry' }} />
      <Stack.Screen name="work/[id]/edit" options={{ title: 'Edit Work Entry' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="account/edit-profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="account/terms" options={{ title: 'Terms & Conditions' }} />
      <Stack.Screen name="account/privacy" options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="account/about" options={{ title: 'About App' }} />
    </Stack>
  );
}
