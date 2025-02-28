import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { PublicRoute } from '../../components/PublicRoute';

export default function Login() {
  const router = useRouter();

  return (
    <PublicRoute>
      <View className="flex-1 justify-center bg-white px-6">
        <Pressable
          onPress={() => router.push('/auth/email-login')}
          className="rounded-xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Login with Email</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/auth/phone-login')}
          className="mt-4 rounded-xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Login with Phone</Text>
        </Pressable>
      </View>
    </PublicRoute>
  );
}
