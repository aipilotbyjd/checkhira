import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { PublicRoute } from '../../components/PublicRoute';
import { AuthHeader } from '../../components/AuthHeader';
import { AuthInput } from '../../components/AuthInput';

export default function Password() {
  const router = useRouter();
  const { email, phone } = useLocalSearchParams<{ email: string; phone: string }>();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const identifier = email || phone;
      await login(identifier, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid credentials. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicRoute>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-white"
      >
        <AuthHeader
          title="Welcome Back"
          subtitle="Enter your password to continue"
          showBack={true}
        />

        <ScrollView className="px-6" keyboardShouldPersistTaps="handled">
          <View className="mb-6">
            <AuthInput
              label="Password"
              icon="lock"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor={COLORS.gray[400]}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              required
            />
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            className="rounded-2xl p-4 mb-6"
            style={{
              backgroundColor: COLORS.primary,
              opacity: isLoading ? 0.7 : 1
            }}
            android_ripple={{ color: COLORS.primary }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-lg font-semibold text-white">Login</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </PublicRoute>
  );
}
