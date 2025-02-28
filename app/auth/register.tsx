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

export default function Register() {
  const router = useRouter();
  const [registrationMethod, setRegistrationMethod] = useState<'phone' | 'email'>('phone');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (!contact.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    // After registration succeed, navigate to profile update page.
    router.push('/auth/update-profile');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 justify-center bg-white px-6">
      <View className="mb-8">
        <Text className="text-center text-4xl font-bold" style={{ color: COLORS.secondary }}>
          Create Account
        </Text>
        <Text className="mt-2 text-center text-lg" style={{ color: COLORS.gray[600] }}>
          Register with your {registrationMethod === 'phone' ? 'Phone Number' : 'Email'}
        </Text>
      </View>
      <View className="mb-4 flex-row justify-center">
        <Pressable
          onPress={() => setRegistrationMethod('phone')}
          className={`rounded-full px-4 py-2 ${registrationMethod === 'phone' ? 'bg-primary' : 'bg-gray-200'}`}>
          <Text style={{ color: registrationMethod === 'phone' ? COLORS.white : COLORS.secondary }}>
            Phone
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setRegistrationMethod('email')}
          className={`ml-4 rounded-full px-4 py-2 ${registrationMethod === 'email' ? 'bg-primary' : 'bg-gray-200'}`}>
          <Text style={{ color: registrationMethod === 'email' ? COLORS.white : COLORS.secondary }}>
            Email
          </Text>
        </Pressable>
      </View>
      <View className="mb-4">
        <Text className="mb-2 text-base" style={{ color: COLORS.gray[600] }}>
          {registrationMethod === 'phone' ? 'Phone Number' : 'Email Address'}
        </Text>
        <TextInput
          value={contact}
          onChangeText={setContact}
          keyboardType={registrationMethod === 'phone' ? 'phone-pad' : 'email-address'}
          placeholder={
            registrationMethod === 'phone' ? 'Enter your phone number' : 'Enter your email'
          }
          placeholderTextColor={COLORS.gray[400]}
          autoCapitalize={registrationMethod === 'email' ? 'none' : 'sentences'}
          className="rounded-xl border p-4"
          style={{
            backgroundColor: COLORS.white,
            borderColor: COLORS.gray[200],
            color: COLORS.secondary,
          }}
        />
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
        onPress={handleRegister}
        className="mb-4 rounded-xl p-4"
        style={{ backgroundColor: COLORS.primary }}>
        <Text className="text-center text-lg font-semibold text-white">Register</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/auth/phone-login')}>
        <Text className="text-center text-base" style={{ color: COLORS.primary }}>
          Already have an account? Login
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
