import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { AuthHeader } from '../../components/AuthHeader';
import { AuthInput } from '../../components/AuthInput';
import { SocialLoginButton } from '../../components/SocialLoginButton';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    c_password: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.c_password) newErrors.c_password = 'Confirm password is required';
    if (formData.password !== formData.c_password) {
      newErrors.c_password = 'Passwords do not match';
    }

    // Optional: Phone number validation if phone registration is supported
    // if (!formData.phone) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await authService.register(formData);
        if (response.status) {
          await login(response.data);
          router.replace('/(tabs)');
        } else {
          Alert.alert('Error', response.message || 'Registration failed');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to register. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1">
        <AuthHeader title="Create Account" subtitle="Sign up to get started" />

        <View className="px-6">
          <View className="mb-4">
            <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
              First Name <Text style={{ color: COLORS.error }}>*</Text>
            </Text>
            <TextInput
              className={`rounded-xl border p-3 ${errors.first_name ? 'border-error' : 'border-gray-200'}`}
              style={{
                backgroundColor: COLORS.white,
                borderColor: errors.first_name ? COLORS.error : COLORS.gray[200],
                color: COLORS.secondary,
              }}
              value={formData.first_name}
              onChangeText={(text) => {
                setFormData({ ...formData, first_name: text });
                if (errors.first_name) {
                  setErrors({ ...errors, first_name: '' });
                }
              }}
              placeholder="Enter your first name"
            />
            {errors.first_name && (
              <Text className="mt-1 text-xs" style={{ color: COLORS.error }}>
                {errors.first_name}
              </Text>
            )}
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
              Last Name <Text style={{ color: COLORS.error }}>*</Text>
            </Text>
            <TextInput
              className={`rounded-xl border p-3 ${errors.last_name ? 'border-error' : 'border-gray-200'}`}
              style={{
                backgroundColor: COLORS.white,
                borderColor: errors.last_name ? COLORS.error : COLORS.gray[200],
                color: COLORS.secondary,
              }}
              value={formData.last_name}
              onChangeText={(text) => {
                setFormData({ ...formData, last_name: text });
                if (errors.last_name) {
                  setErrors({ ...errors, last_name: '' });
                }
              }}
              placeholder="Enter your last name"
            />
            {errors.last_name && (
              <Text className="mt-1 text-xs" style={{ color: COLORS.error }}>
                {errors.last_name}
              </Text>
            )}
          </View>

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

          <View className="mb-4">
            <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
              Confirm Password <Text style={{ color: COLORS.error }}>*</Text>
            </Text>
            <TextInput
              className={`rounded-xl border p-3 ${errors.c_password ? 'border-error' : 'border-gray-200'}`}
              style={{
                backgroundColor: COLORS.white,
                borderColor: errors.c_password ? COLORS.error : COLORS.gray[200],
                color: COLORS.secondary,
              }}
              value={formData.c_password}
              onChangeText={(text) => {
                setFormData({ ...formData, c_password: text });
                if (errors.c_password) {
                  setErrors({ ...errors, c_password: '' });
                }
              }}
              placeholder="Confirm your password"
              secureTextEntry
            />
            {errors.c_password && (
              <Text className="mt-1 text-xs" style={{ color: COLORS.error }}>
                {errors.c_password}
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleRegister}
            className="mb-6 rounded-xl p-4"
            style={{ backgroundColor: COLORS.primary }}
            disabled={isLoading}>
            <Text className="text-center text-lg font-semibold text-white">
              {isLoading ? 'Registering...' : 'Register'}
            </Text>
          </Pressable>

          <View className="mb-6 flex-row items-center">
            <View className="flex-1 border-t" style={{ borderColor: COLORS.gray[200] }} />
            <Text className="mx-4 text-sm" style={{ color: COLORS.gray[400] }}>
              Or continue with
            </Text>
            <View className="flex-1 border-t" style={{ borderColor: COLORS.gray[200] }} />
          </View>

          <SocialLoginButton
            icon="google"
            label="Continue with Google"
            onPress={() => {
              // TODO: Implement Google login
              console.log('Google login');
            }}
          />

          <View className="mb-6 flex-row justify-center">
            <Text style={{ color: COLORS.gray[400] }}>Already have an account? </Text>
            <Link href="/auth/login" asChild>
              <Pressable>
                <Text style={{ color: COLORS.primary }}>Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
