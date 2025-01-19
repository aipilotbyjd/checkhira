import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { AuthHeader } from '../../components/AuthHeader';
import { AuthInput } from '../../components/AuthInput';
import { authService } from '../../services/authService';
import { SuccessModal } from '../../components/SuccessModal';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleResetPassword = async () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await authService.forgotPassword(email);
        if (response.status) {
          setShowSuccessModal(true);
        } else {
          Alert.alert('Error', response.message || 'Failed to send reset password email');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to process request. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1">
        <AuthHeader
          title="Forgot Password"
          subtitle="Enter your email address to reset your password"
        />

        <View className="px-6">
          <AuthInput
            label="Email"
            icon="email-outline"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            required
          />

          <Pressable
            onPress={handleResetPassword}
            className="mb-6 rounded-xl p-4"
            style={{ backgroundColor: COLORS.primary }}
            disabled={isLoading}>
            <Text className="text-center text-lg font-semibold text-white">
              {isLoading ? 'Sending...' : 'Reset Password'}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.back()}>
            <Text className="text-center text-sm" style={{ color: COLORS.primary }}>
              Back to Login
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.replace('/auth/login');
        }}
        message="Password reset instructions have been sent to your email"
      />
    </View>
  );
}
