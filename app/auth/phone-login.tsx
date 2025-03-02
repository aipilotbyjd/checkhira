import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { PublicRoute } from '../../components/PublicRoute';
import { AuthHeader } from '../../components/AuthHeader';
import { AuthInput } from '../../components/AuthInput';

export default function PhoneLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState('');

  const validatePhone = (number: string) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    return phoneRegex.test(number);
  };

  const handleContinue = () => {
    const cleanedPhone = phone.trim();

    if (!cleanedPhone) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }

    if (!validatePhone(cleanedPhone)) {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }

    router.push(`/auth/password?phone=${encodeURIComponent(cleanedPhone)}`);
  };

  return (
    <PublicRoute>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-white"
      >
        <AuthHeader
          title="Welcome Back"
          subtitle="Login to continue your journey"
          showBack={false}
        />

        <ScrollView className="px-6" keyboardShouldPersistTaps="handled">
          <View className="mb-6">
            <AuthInput
              label="Phone Number"
              icon="phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+1 234 567 890"
              placeholderTextColor={COLORS.gray[400]}
              maxLength={15}
              required
            />
          </View>

          <Pressable
            onPress={handleContinue}
            className="rounded-2xl p-4 mb-4"
            style={{ backgroundColor: COLORS.primary }}
            android_ripple={{ color: COLORS.primary }}
          >
            <Text className="text-center text-lg font-semibold text-white">
              Continue
            </Text>
          </Pressable>

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="px-4 text-sm" style={{ color: COLORS.gray[400] }}>
              OR
            </Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <Pressable
            onPress={() => router.push('/auth/email-login')}
            className="rounded-xl border p-4 mb-6"
            style={{ borderColor: COLORS.primary }}
          >
            <Text className="text-center text-lg font-semibold" style={{ color: COLORS.primary }}>
              Continue with Email
            </Text>
          </Pressable>

          <View className="flex-row justify-center mt-8">
            <Text className="text-sm" style={{ color: COLORS.gray[600] }}>
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={() => router.push('/auth/register')}>
              <Text className="text-sm font-semibold" style={{ color: COLORS.primary }}>
                Register
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PublicRoute>
  );
}
