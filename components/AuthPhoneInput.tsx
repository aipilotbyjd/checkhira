import { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthInput } from './AuthInput';
import { authService } from '../services/authService';
import { COLORS } from '../constants/theme';

export default function AuthPhoneInput({
  onPhoneSubmit,
}: {
  onPhoneSubmit: (phone: string) => void;
}) {
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    const newErrors: Record<string, string> = {};
    if (!phone) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await authService.phoneLogin(phone);
        if (response.status) {
          onPhoneSubmit(phone);
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

  return (
    <View className="mb-6">
      <AuthInput
        label="Phone Number"
        icon="phone-outline"
        placeholder="Enter your phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        error={errors.phone}
        required
      />

      <Pressable
        onPress={handleSendOtp}
        className="rounded-xl p-4"
        style={{ backgroundColor: COLORS.primary }}
        disabled={isLoading}>
        <Text className="text-center text-lg font-semibold text-white">
          {isLoading ? 'Sending OTP...' : 'Send OTP'}
        </Text>
      </Pressable>
    </View>
  );
}
