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

export default function EmailPassword() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }
    // Implement your login API call here using email and password.
    // On successful login, navigate to your main app screen:
    router.push('/(tabs)');
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
          Enter your password
        </Text>
        {email && (
          <Text className="mt-1 text-center text-base" style={{ color: COLORS.gray[600] }}>
            {email}
          </Text>
        )}
      </View>
      <View className="mb-6">
        <Text className="mb-2 text-base" style={{ color: COLORS.gray[600] }}>
          Password
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter your password"
          placeholderTextColor={COLORS.gray[400]}
          className="rounded-xl border p-4"
          style={{
            backgroundColor: COLORS.white,
            borderColor: COLORS.gray[200],
            color: COLORS.secondary,
          }}
        />
      </View>
      <Pressable
        onPress={handleLogin}
        className="mb-4 rounded-xl p-4"
        style={{ backgroundColor: COLORS.primary }}>
        <Text className="text-center text-lg font-semibold text-white">Login</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/auth/email-login')}>
        <Text className="text-center text-base" style={{ color: COLORS.primary }}>
          Back to Email Entry
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
