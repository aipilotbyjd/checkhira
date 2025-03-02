import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { PublicRoute } from '../../components/PublicRoute';
import { AuthHeader } from '../../components/AuthHeader';

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
      <AuthHeader
        title="Create Account"
        subtitle="Choose your registration method"
        showBack={false}
      />
      <View className="px-6">
        <Pressable
          onPress={() => router.push('/auth/register-email')}
          className="rounded-xl p-4 mb-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Register with Email</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/auth/register-phone')}
          className="rounded-xl border p-4"
          style={{ borderColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold" style={{ color: COLORS.primary }}>
            Register with Phone
          </Text>
        </Pressable>

        <View className="flex-row justify-center space-x-2 mt-6">
          <Text className="text-base" style={{ color: COLORS.gray[600] }}>
            Already have an account?
          </Text>
          <Pressable onPress={() => router.push('/auth/phone-login')}>
            <Text className="text-base font-semibold" style={{ color: COLORS.primary }}>
              Login
            </Text>
          </Pressable>
        </View>
      </View>
    </PublicRoute>
  );
}
