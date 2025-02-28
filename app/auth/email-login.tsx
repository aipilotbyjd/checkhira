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

export default function EmailLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleContinue = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    // Navigate to the password screen, passing the email as a query parameter
    router.push(`/auth/email-password?email=${encodeURIComponent(email)}`);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 justify-center bg-white px-6">
      <View className="mb-8">
        <Text className="text-center text-4xl font-bold" style={{ color: COLORS.secondary }}>
          Welcome Back!
        </Text>
        <Text className="mt-2 text-center text-lg" style={{ color: COLORS.gray[600] }}>
          Login with Email
        </Text>
      </View>
      <View className="mb-4">
        <Text className="mb-2 text-base" style={{ color: COLORS.gray[600] }}>
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
        className="mb-4 rounded-xl p-4"
        style={{ backgroundColor: COLORS.primary }}>
        <Text className="text-center text-lg font-semibold text-white">Continue</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/auth/phone-login')}>
        <Text className="text-center text-base" style={{ color: COLORS.primary }}>
          Or login with Phone
        </Text>
      </Pressable>
      <Pressable onPress={() => router.push('/auth/register')} className="mt-8">
        <Text className="text-center text-base" style={{ color: COLORS.gray[600] }}>
          Don't have an account? Register
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
