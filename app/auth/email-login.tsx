import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { AuthHeader } from '../../components/AuthHeader';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

export default function EmailLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await authService.login({
          email: formData.email,
          password: formData.password,
        });

        if (response.status) {
          await login(response.data);
          router.push('/(tabs)');
        } else {
          Alert.alert('Error', response.message || 'Login failed');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to login. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1">
        <AuthHeader title="Email Login" subtitle="Sign in with your email" />

        <View className="px-6">
          {/* Email Input */}
          <View className="mb-4">
            <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
              Email <Text style={{ color: COLORS.error }}>*</Text>
            </Text>
            <TextInput
              className={`rounded-xl border p-3 ${errors.email ? 'border-error' : 'border-gray-200'}`}
              style={{
                backgroundColor: COLORS.white,
                borderColor: errors.email ? COLORS.error : COLORS.gray[200],
                color: COLORS.secondary,
              }}
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                if (errors.email) {
                  setErrors({ ...errors, email: '' });
                }
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text className="mt-1 text-xs" style={{ color: COLORS.error }}>
                {errors.email}
              </Text>
            )}
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
              Password <Text style={{ color: COLORS.error }}>*</Text>
            </Text>
            <TextInput
              className={`rounded-xl border p-3 ${errors.password ? 'border-error' : 'border-gray-200'}`}
              style={{
                backgroundColor: COLORS.white,
                borderColor: errors.password ? COLORS.error : COLORS.gray[200],
                color: COLORS.secondary,
              }}
              value={formData.password}
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                if (errors.password) {
                  setErrors({ ...errors, password: '' });
                }
              }}
              placeholder="Enter your password"
              secureTextEntry
            />
            {errors.password && (
              <Text className="mt-1 text-xs" style={{ color: COLORS.error }}>
                {errors.password}
              </Text>
            )}
          </View>

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            className="mb-6 rounded-xl p-4"
            style={{ backgroundColor: COLORS.primary }}
            disabled={isLoading}>
            <Text className="text-center text-lg font-semibold text-white">
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </Pressable>

          {/* Forgot Password */}
          <Pressable onPress={() => router.push('/auth/forgot-password')}>
            <Text className="text-center text-sm" style={{ color: COLORS.primary }}>
              Forgot Password?
            </Text>
          </Pressable>

          {/* Back to Login Options */}
          <View className="mb-6 mt-4 flex-row justify-center">
            <Text style={{ color: COLORS.gray[400] }}>Or continue with</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
