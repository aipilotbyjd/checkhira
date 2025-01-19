import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { AuthHeader } from '../../components/AuthHeader';
import { AuthInput } from '../../components/AuthInput';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

export default function VerifyOtp() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const { login } = useAuth();
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOtp = async () => {
    const newErrors: Record<string, string> = {};
    if (!otp) newErrors.otp = 'OTP is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await authService.verifyOtp(phone as string, otp);
        if (response.status) {
          await login(response.data);
          router.push('/(tabs)');
        } else {
          Alert.alert('Error', response.message || 'Invalid OTP');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to verify OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await authService.phoneLogin(phone as string);
      if (response.status) {
        Alert.alert('Success', 'OTP has been resent to your phone');
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1">
        <AuthHeader title="Verify OTP" subtitle={`Enter the OTP sent to ${phone}`} />

        <View className="px-6">
          <AuthInput
            label="OTP"
            icon="lock-outline"
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            error={errors.otp}
            required
          />

          <Pressable
            onPress={handleVerifyOtp}
            className="mb-6 rounded-xl p-4"
            style={{ backgroundColor: COLORS.primary }}
            disabled={isLoading}>
            <Text className="text-center text-lg font-semibold text-white">
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </Pressable>

          <Pressable onPress={handleResendOtp} disabled={isLoading}>
            <Text className="text-center text-sm" style={{ color: COLORS.primary }}>
              Resend OTP
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
