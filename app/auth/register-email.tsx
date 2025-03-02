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
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { PublicRoute } from '../../components/PublicRoute';

export default function RegisterEmail() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleContinue = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    router.push(`/auth/register-phone?email=${encodeURIComponent(email)}`);
  };

  return (
    <PublicRoute>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-center bg-white px-6"
      >
        <View className="mb-8">
          <Text
            className="text-center text-4xl font-bold"
            style={{ color: COLORS.secondary }}
          >
            Create Account
          </Text>
          <Text
            className="mt-2 text-center text-lg"
            style={{ color: COLORS.gray[600] }}
          >
            Enter your email address
          </Text>
        </View>
        <View className="mb-4">
          <Text
            className="mb-2 text-base"
            style={{ color: COLORS.gray[600] }}
          >
            Email Address
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Enter your email"
            placeholderTextColor={COLORS.gray[400]}
            autoCapitalize="none"
            className="rounded-xl border p-4"
            style={{
              backgroundColor: COLORS.white,
              borderColor: COLORS.gray[200],
              color: COLORS.secondary,
            }}
          />
        </View>
        <Pressable
          onPress={handleContinue}
          className="rounded-xl p-4"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="text-center text-lg font-semibold text-white">
            Next
          </Text>
        </Pressable>

        <View className="flex-row justify-center space-x-2 mt-4">
          <Text className="text-base" style={{ color: COLORS.gray[600] }}>
            Already have an account?
          </Text>
          <Pressable onPress={() => router.push('/auth/email-login')}>
            <Text className="text-base font-semibold" style={{ color: COLORS.primary }}>
              Login
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </PublicRoute>
  );
}
