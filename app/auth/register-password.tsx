import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { PublicRoute } from '../../components/PublicRoute';
import { AuthHeader } from '../../components/AuthHeader';
import { AuthInput } from '../../components/AuthInput';

export default function RegisterPassword() {
  const router = useRouter();
  const { email, phone } = useLocalSearchParams<{ email: string; phone: string }>();
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();

  const handleRegister = async () => {
    if (!first_name.trim()) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }

    if (!last_name.trim()) {
      Alert.alert('Error', 'Please enter your last name.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const registerData = {
        first_name: first_name,
        last_name: last_name,
        email: email ? decodeURIComponent(email) : '',
        phone: phone ? decodeURIComponent(phone) : '',
        password,
        profile_image: '',
      };

      await register(registerData);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Unable to register. Please try again.'
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
          title="Create Account"
          subtitle="Final step to complete your registration"
          showBack={false}
        />

        <ScrollView className="px-6" keyboardShouldPersistTaps="handled">
          <View className="mb-6">
            <AuthInput
              label="First Name"
              icon="account"
              value={first_name}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor={COLORS.gray[400]}
              autoCapitalize="words"
              required
            />
            <AuthInput
              label="Last Name"
              icon="account"
              value={last_name}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor={COLORS.gray[400]}
              autoCapitalize="words"
              required
            />
          </View>

          <View className="mb-6">
            <AuthInput
              label="Password"
              icon="lock"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Create a strong password"
              placeholderTextColor={COLORS.gray[400]}
              required
            />
          </View>

          <Pressable
            onPress={handleRegister}
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
              <Text className="text-center text-lg font-semibold text-white">
                Complete Registration
              </Text>
            )}
          </Pressable>

          <View className="flex-row justify-center mb-8">
            <Text className="text-sm" style={{ color: COLORS.gray[600] }}>
              Already have an account?{' '}
            </Text>
            <Pressable onPress={() => router.push('/auth/phone-login')}>
              <Text className="text-sm font-semibold" style={{ color: COLORS.primary }}>
                Login
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PublicRoute>
  );
}
