import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { PublicRoute } from '../../components/PublicRoute';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.email = 'Either email or phone number is required';
      newErrors.phone = 'Either email or phone number is required';
    }

    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone.trim() && !/^([0-9\s\-\+\(\)]*)$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <PublicRoute>
      <View className="flex-1 justify-center bg-white px-6">
        <Text className="text-center text-4xl font-bold" style={{ color: COLORS.secondary }}>
          Create Account
        </Text>
        <Text className="mt-2 text-center text-lg" style={{ color: COLORS.gray[600] }}>
          Choose your registration method
        </Text>
        <Pressable
          onPress={() => router.push('/auth/register-email')}
          className="mt-6 rounded-xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Register with Email</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/auth/register-phone')}
          className="mt-4 rounded-xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Register with Phone</Text>
        </Pressable>
      </View>
    </PublicRoute>
  );
}
