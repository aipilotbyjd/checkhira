import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { AuthHeader } from '../../components/AuthHeader';
import { AuthInput } from '../../components/AuthInput';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

export default function PhoneLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    const newErrors: Record<string, string> = {};
    if (!phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await authService.phoneLogin(phoneNumber);
        if (response.status) {
          setShowOtp(true);
        } else {
          Alert.alert('Error', response.message || 'Failed to send OTP');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to send OTP. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyOtp = async () => {
    const newErrors: Record<string, string> = {};
    if (!otp) newErrors.otp = 'OTP is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await authService.verifyOtp(phoneNumber, otp);
        if (response.status) {
          await login(response.data);
          router.replace('/(tabs)');
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

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1">
        <AuthHeader
          title="Phone Login"
          subtitle={showOtp ? 'Enter the OTP sent to your phone' : 'Enter your phone number to continue'}
        />

        <View className="px-6">
          {!showOtp ? (
            <>
              <AuthInput
                label="Phone Number"
                icon="phone-outline"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                error={errors.phoneNumber}
                required
              />

              <Pressable
                onPress={handleSendOtp}
                className="mb-6 rounded-xl p-4"
                style={{ backgroundColor: COLORS.primary }}
                disabled={isLoading}>
                <Text className="text-center text-lg font-semibold text-white">
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
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

              <Pressable onPress={handleSendOtp} disabled={isLoading}>
                <Text className="text-center text-sm" style={{ color: COLORS.primary }}>
                  Resend OTP
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
