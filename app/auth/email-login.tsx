import React, { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { PublicRoute } from '../../components/PublicRoute';
import { AuthHeader } from '../../components/AuthHeader';
import { AuthInput } from '../../components/AuthInput';
import { useLanguage } from '../../contexts/LanguageContext';

export default function EmailLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleContinue = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    router.push(`/auth/password?email=${encodeURIComponent(email)}`);
  };

  return (
    <PublicRoute>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-white"
      >
        <AuthHeader
          title={t('welcomeBack')}
          subtitle={t('loginToContinue')}
          showBack={false}
        />

        <ScrollView className="px-6" keyboardShouldPersistTaps="handled">
          <View className="mb-6">
            <AuthInput
              label="Email Address"
              icon="email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="Enter your email"
              placeholderTextColor={COLORS.gray[400]}
              autoCapitalize="none"
              required
            />
          </View>

          <Pressable
            onPress={handleContinue}
            className="rounded-2xl p-4 mb-4"
            style={{ backgroundColor: COLORS.primary }}
            android_ripple={{ color: COLORS.primary }}
          >
            <Text className="text-center text-lg font-semibold text-white">
              {t('continue')}
            </Text>
          </Pressable>

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="px-4 text-sm" style={{ color: COLORS.gray[400] }}>
              OR
            </Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <Pressable
            onPress={() => router.push('/auth/phone-login')}
            className="rounded-xl border p-4 mb-6"
            style={{ borderColor: COLORS.primary }}
          >
            <Text className="text-center text-lg font-semibold" style={{ color: COLORS.primary }}>
              {t('continueWithPhone')}
            </Text>
          </Pressable>

          <View className="flex-row justify-center mt-8">
            <Text className="text-sm" style={{ color: COLORS.gray[600] }}>
              Don't have an account?{' '}
            </Text>
            <Pressable onPress={() => router.push('/auth/register')}>
              <Text className="text-sm font-semibold" style={{ color: COLORS.primary }}>
                Register
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PublicRoute>
  );
}
