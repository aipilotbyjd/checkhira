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

export default function RegisterPhone() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [phone, setPhone] = useState('');

  const handleContinue = () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }
    // Optional: add phone number validation here
    router.push(
      `/auth/register-password?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`
    );
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
          Enter your phone number
        </Text>
      </View>
      <View className="mb-4">
        <Text
          className="mb-2 text-base"
          style={{ color: COLORS.gray[600] }}
        >
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
        className="rounded-xl p-4"
        style={{ backgroundColor: COLORS.primary }}
      >
        <Text className="text-center text-lg font-semibold text-white">
          Next
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
