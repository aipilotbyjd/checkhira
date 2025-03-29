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
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

export default function PhoneLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const validatePhone = (number: string) => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
    return phoneRegex.test(number);
  };

  const handleContinue = () => {
    const cleanedPhone = phone.trim();

    if (!cleanedPhone) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }

    if (!validatePhone(cleanedPhone)) {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }

    router.push(`/auth/password?phone=${encodeURIComponent(cleanedPhone)}`);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken, user } = response.data;
        const { name, email, photo } = user;

        Alert.alert(
          'Google Sign In',
          `User ID: ${idToken}\nUser Name: ${name}\nUser Email: ${email}\nUser Photo: ${photo}`,
          [{ text: 'OK', onPress: () => setIsLoading(false) }],
          { cancelable: false },
        );
      } else {
        // sign in was cancelled by user
        Alert.alert(
          'Google Sign In',
          'Sign in was cancelled by user',
          [{ text: 'OK', onPress: () => setIsLoading(false) }],
          { cancelable: false },
        );
      }

      setIsLoading(false);
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            Alert.alert(
              'Google Sign In',
              'Operation (eg. sign in) already in progress',
              [{ text: 'OK', onPress: () => setIsLoading(false) }],
              { cancelable: false },
            );
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            Alert.alert(
              'Google Sign In',
              'Android only, play services not available or outdated',
              [{ text: 'OK', onPress: () => setIsLoading(false) }],
              { cancelable: false },
            )
            break;
          default:
            // some other error happened
            console.log(error);
            Alert.alert(
              'Google Sign In',
              'Some other error happened',
              [{ text: 'OK', onPress: () => setIsLoading(false) }],
              { cancelable: false },
            );
        }
      } else {
        // an error that's not related to google sign in occurred
        Alert.alert(
          'Google Sign In',
          'An error that\'s not related to google sign in occurred',
          [{ text: 'OK', onPress: () => setIsLoading(false) }],
          { cancelable: false },
        )
      }
    }
  }

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
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            className="rounded-xl border p-4 mb-4"
            style={{ borderColor: COLORS.primary }}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <Text className="text-center text-lg font-semibold" style={{ color: COLORS.primary }}>
                {t('signInWithGoogle')}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => GoogleSignin.signOut()}
            className="rounded-xl border p-4 mb-4"
            style={{ borderColor: COLORS.primary }}
          >
            <Text className="text-center text-lg font-semibold" style={{ color: COLORS.primary }}>
              Sign Out
            </Text>
          </Pressable>

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
