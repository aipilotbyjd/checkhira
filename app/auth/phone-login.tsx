import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { COLORS } from '../../constants/theme';
import { AuthHeader } from '../../components/AuthHeader';
import { AuthInput } from '../../components/AuthInput';

export default function PhoneLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSendOtp = () => {
    const newErrors: Record<string, string> = {};

    if (!phoneNumber) newErrors.phoneNumber = 'Phone number is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // TODO: Implement send OTP logic
      console.log('Send OTP:', phoneNumber);
      setShowOtp(true);
    }
  };

  const handleVerifyOtp = () => {
    const newErrors: Record<string, string> = {};

    if (!otp) newErrors.otp = 'OTP is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // TODO: Implement verify OTP logic
      console.log('Verify OTP:', { phoneNumber, otp });
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1">
        <AuthHeader
          title="Phone Login"
          subtitle={
            showOtp ? 'Enter the OTP sent to your phone' : 'Enter your phone number to continue'
          }
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
                style={{ backgroundColor: COLORS.primary }}>
                <Text className="text-center text-lg font-semibold text-white">Send OTP</Text>
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
                style={{ backgroundColor: COLORS.primary }}>
                <Text className="text-center text-lg font-semibold text-white">Verify OTP</Text>
              </Pressable>

              <Pressable onPress={() => handleSendOtp()}>
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
