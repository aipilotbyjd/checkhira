import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { PublicRoute } from '../../components/PublicRoute';

export default function EmailLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    router.push(`/auth/password?email=${encodeURIComponent(email)}`);
  };

  return (
    <PublicRoute>
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
          disabled={isLoading}
          className="mb-4 rounded-xl p-4"
          style={{
            backgroundColor: COLORS.primary,
            opacity: isLoading ? 0.7 : 1
          }}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-lg font-semibold text-white">Continue</Text>
          )}
        </Pressable>
        <View className="flex-row justify-center space-x-2 mt-4">
          <Text className="text-base" style={{ color: COLORS.gray[600] }}>
            Don't have an account?
          </Text>
          <Pressable onPress={() => router.push('/auth/register')}>
            <Text className="text-base font-semibold" style={{ color: COLORS.primary }}>
              Register
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={() => router.push('/auth/phone-login')}
          className="mt-4 rounded-xl border p-4"
          style={{ borderColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold" style={{ color: COLORS.primary }}>
            Or login with Phone
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </PublicRoute>
  );
}
