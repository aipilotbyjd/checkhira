import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { PublicRoute } from '../../components/PublicRoute';

export default function Register() {
  const router = useRouter();

  return (
    <PublicRoute>
      <View className="flex-1 justify-center bg-white px-6">
        <Text className="text-center text-4xl font-bold" style={{ color: COLORS.secondary }}>
          Create Account
        </Text>
        <Text className="mt-2 text-center text-lg" style={{ color: COLORS.gray[600] }}>
          Choose your registration method
        </Text>
        <Pressable
          onPress={() => router.push('/auth/register-email')}
          className="mt-6 rounded-xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Register with Email</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/auth/register-phone')}
          className="mt-4 rounded-xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Register with Phone</Text>
        </Pressable>
      </View>
    </PublicRoute>
  );
}
