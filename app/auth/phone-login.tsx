import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { PublicRoute } from '../../components/PublicRoute';
import { AuthHeader } from '../../components/AuthHeader';

export default function PhoneLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState('');

  const handleContinue = () => {
    if (!phone.trim()) return;
    router.push(`/auth/password?phone=${encodeURIComponent(phone)}`);
  };

  return (
    <PublicRoute>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-white">
        <AuthHeader
          title="Welcome Back"
          subtitle="Login to continue your journey"
          showBack={false}
        />

        <View className="px-6">
          <Text className="text-base mb-2" style={{ color: COLORS.gray[600] }}>
            Phone Number
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Enter your phone number"
            placeholderTextColor={COLORS.gray[400]}
            className="rounded-xl border p-4 mb-6"
            style={{
              backgroundColor: COLORS.white,
              borderColor: COLORS.gray[200],
              color: COLORS.secondary,
            }}
          />

          <Pressable
            onPress={handleContinue}
            className="rounded-xl p-4 mb-4"
            style={{ backgroundColor: COLORS.primary }}>
            <Text className="text-center text-lg font-semibold text-white">Continue</Text>
          </Pressable>

          <View className="flex-row justify-center space-x-2 mb-6">
            <Text className="text-base" style={{ color: COLORS.gray[600] }}>
              Don't have an account?
            </Text>
            <Pressable onPress={() => router.push('/auth/register')}>
              <Text className="text-base font-semibold" style={{ color: COLORS.primary }}>
                Register
              </Text>
            </Pressable>
          </View>

          <View className="flex-row items-center space-x-3 mb-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-base" style={{ color: COLORS.gray[400] }}>OR</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <Pressable
            onPress={() => router.push('/auth/email-login')}
            className="rounded-xl border p-4"
            style={{ borderColor: COLORS.primary }}>
            <Text className="text-center text-lg font-semibold" style={{ color: COLORS.primary }}>
              Login with Email
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </PublicRoute>
  );
}
