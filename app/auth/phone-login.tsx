import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { PublicRoute } from '../../components/PublicRoute';
import { AuthHeader } from '../../components/AuthHeader';
import { AuthInput } from '../../components/AuthInput';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useAnalytics } from '../../hooks/useAnalytics';
import { analyticsService } from '../../utils/analytics';

export default function PhoneLogin() {
  useAnalytics('PhoneLoginScreen');
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const { showToast } = useToast();

  const validatePhone = (number: string) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    return phoneRegex.test(number);
  };

  const handleContinue = () => {
    const cleanedPhone = phone.trim();

    if (!cleanedPhone) {
      analyticsService.logEvent('phone_login_validation_failed', { reason: 'empty_phone_number' });
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }

    if (!validatePhone(cleanedPhone)) {
      analyticsService.logEvent('phone_login_validation_failed', { reason: 'invalid_phone_number' }); // Log the event with reason
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }

    analyticsService.logEvent('phone_login_phone_entered', { phone: cleanedPhone });
    router.push(`/auth/password?phone=${encodeURIComponent(cleanedPhone)}`);
  };

  const getGoogleErrorKey = (code: string) => {
    switch (code) {
      case statusCodes.IN_PROGRESS:
        return 'googleSignInErrors.IN_PROGRESS';
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        return 'googleSignInErrors.PLAY_SERVICES_NOT_AVAILABLE';
      case statusCodes.SIGN_IN_CANCELLED:
        return 'googleSignInErrors.SIGN_IN_CANCELLED';
      case statusCodes.SIGN_IN_REQUIRED:
        return 'googleSignInErrors.SIGN_IN_REQUIRED';
      default:
        return 'googleSignInErrors.UNKNOWN_ERROR';
    }
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
              label="Phone Number"
              icon="phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+1 234 567 890"
              placeholderTextColor={COLORS.gray[400]}
              maxLength={15}
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
            onPress={() => router.push('/auth/email-login')}
            className="rounded-xl border p-4 mb-6"
            style={{ borderColor: COLORS.primary }}
          >
            <Text className="text-center text-lg font-semibold" style={{ color: COLORS.primary }}>
              {t('continueWithEmail')}
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
