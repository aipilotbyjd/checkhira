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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 justify-center bg-white px-6">
      <View className="mb-8">
        <Text className="text-center text-4xl font-bold" style={{ color: COLORS.secondary }}>
          Welcome Back!
        </Text>
        <Text className="mt-2 text-center text-lg" style={{ color: COLORS.gray[600] }}>
          Enter your password to login
        </Text>
        <Text className="mt-2 text-center text-base" style={{ color: COLORS.gray[400] }}>
          {email || phone}
        </Text>
      </View>

      <View className="mb-4">
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
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />
      </View>

      <Pressable
        onPress={handleLogin}
        disabled={isLoading}
        className="mb-4 rounded-xl p-4"
        style={{ 
          backgroundColor: COLORS.primary,
          opacity: isLoading ? 0.7 : 1 
        }}>
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-center text-lg font-semibold text-white">Login</Text>
        )}
      </Pressable>
    </KeyboardAvoidingView>
  );
}
