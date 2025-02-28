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

export default function RegisterPassword() {
  const router = useRouter();
  const { email, phone } = useLocalSearchParams<{ email: string; phone: string }>();
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }
    // Implement your registration API using email, phone, and password here.
    // On successful registration, navigate to the update profile screen.
    router.push('/auth/update-profile');
  };

  return (
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
          Set your password
        </Text>
        {email && (
          <Text
            className="mt-1 text-center text-base"
            style={{ color: COLORS.gray[600] }}
          >
            {email}
          </Text>
        )}
      </View>
      <View className="mb-4">
        <Text
          className="mb-2 text-base"
          style={{ color: COLORS.gray[600] }}
        >
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
        onPress={handleRegister}
        className="rounded-xl p-4"
        style={{ backgroundColor: COLORS.primary }}
      >
        <Text className="text-center text-lg font-semibold text-white">
          Register
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
