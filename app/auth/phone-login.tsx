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

export default function PhoneLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState('');

  const handleContinue = () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    // Navigate to the dedicated phone password screen—this screen will handle password input.
    router.push(`/auth/password?phone=${encodeURIComponent(phone)}`);
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
          Login with your phone number
        </Text>
      </View>
      <View className="mb-6">
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
        />
      </View>
      <Pressable
        onPress={handleContinue}
        className="mb-4 rounded-xl p-4"
        style={{ backgroundColor: COLORS.primary }}>
        <Text className="text-center text-lg font-semibold text-white">Continue</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/auth/email-login')}>
        <Text className="text-center text-base" style={{ color: COLORS.primary }}>
          Or login with Email
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
