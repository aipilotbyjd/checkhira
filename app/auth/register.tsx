import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { AuthHeader } from '../../components/AuthHeader';
import { PublicRoute } from '../../components/PublicRoute';

export default function RegisterPhone() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
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

    router.push(
      `/auth/register-password?email=${encodeURIComponent(email!)}&phone=${encodeURIComponent(cleanedPhone)}`
    );
  };

  return (
    <PublicRoute>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-white px-6"
      >
        <AuthHeader
          title="Create Account"
          subtitle="Enter your phone number"
          showBack={false}
        />

        <View className="mb-4">
          <Text className="mb-2 text-base" style={{ color: COLORS.gray[600] }}>
            Phone Number
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Enter your phone number"
            placeholderTextColor={COLORS.gray[400]}
            className="rounded-xl border p-4"
            style={{
              backgroundColor: COLORS.white,
              borderColor: COLORS.gray[200],
              color: COLORS.secondary,
            }}
            maxLength={15}
          />
        </View>

        <Pressable
          onPress={handleContinue}
          className="rounded-xl p-4 mb-4"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="text-center text-lg font-semibold text-white">
            Continue
          </Text>
        </Pressable>

        <View className="flex-row justify-center space-x-2 mb-6">
          <Text className="text-base" style={{ color: COLORS.gray[600] }}>
            Already have an account?
          </Text>
          <Pressable onPress={() => router.push('/auth/phone-login')}>
            <Text className="text-base font-semibold" style={{ color: COLORS.primary }}>
              Login
            </Text>
          </Pressable>
        </View>

        <View className="flex-row items-center space-x-3 mb-6">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-base" style={{ color: COLORS.gray[400] }}>OR</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        <Pressable
          onPress={() => router.push('/auth/register-email')}
          className="rounded-xl border p-4"
          style={{ borderColor: COLORS.primary }}
        >
          <Text className="text-center text-lg font-semibold" style={{ color: COLORS.primary }}>
            Use Email Instead
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </PublicRoute>
  );
}
