import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.c_password) newErrors.c_password = 'Confirm password is required';
    if (formData.password !== formData.c_password) {
      newErrors.c_password = 'Passwords do not match';
    }

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
          <AuthInput
            label="First Name"
            icon="account-outline"
            placeholder="Enter your first name"
            value={formData.first_name}
            onChangeText={(text) => setFormData({ ...formData, first_name: text })}
            error={errors.first_name}
            required
          />

          <AuthInput
            label="Last Name"
            icon="account-outline"
            placeholder="Enter your last name"
            value={formData.last_name}
            onChangeText={(text) => setFormData({ ...formData, last_name: text })}
            error={errors.last_name}
            required
          />

          <AuthInput
            label="Email"
            icon="email-outline"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            required
          />

          <AuthInput
            label="Password"
            icon="lock-outline"
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
            error={errors.password}
            required
          />

          <AuthInput
            label="Confirm Password"
            icon="lock-outline"
            placeholder="Confirm your password"
            value={formData.c_password}
            onChangeText={(text) => setFormData({ ...formData, c_password: text })}
            secureTextEntry
            error={errors.c_password}
            required
          />

          <Pressable
            onPress={handleRegister}
            className="mb-6 rounded-xl p-4"
            style={{ backgroundColor: COLORS.primary }}
            disabled={isLoading}>
            <Text className="text-center text-lg font-semibold text-white">Sign Up</Text>
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
