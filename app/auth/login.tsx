import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { AuthHeader } from '../../components/AuthHeader';
import { AuthInput } from '../../components/AuthInput';
import { SocialLoginButton } from '../../components/SocialLoginButton';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await authService.login({ email, password });
        if (response.status) {
          await login(response.data);
          router.replace('/(tabs)');
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
        <AuthHeader title="Welcome Back!" subtitle="Sign in to continue" showBack={false} />

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

          <AuthInput
            label="Password"
            icon="lock-outline"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
            required
          />

          <Link href="/auth/forgot-password" asChild>
            <Pressable>
              <Text className="mb-6 text-right text-sm" style={{ color: COLORS.primary }}>
                Forgot Password?
              </Text>
            </Pressable>
          </Link>

          <Pressable
            onPress={handleLogin}
            className="mb-6 rounded-xl p-4"
            style={{ backgroundColor: COLORS.primary }}
            disabled={isLoading}>
            <Text className="text-center text-lg font-semibold text-white">
              {isLoading ? 'Signing in...' : 'Sign In'}
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

          <Link href="/auth/phone-login" asChild>
            <Pressable className="mb-6">
              <SocialLoginButton icon="phone" label="Continue with Phone" onPress={() => {}} />
            </Pressable>
          </Link>

          <View className="mb-6 flex-row justify-center">
            <Text style={{ color: COLORS.gray[400] }}>Don't have an account? </Text>
            <Link href="/auth/register" asChild>
              <Pressable>
                <Text style={{ color: COLORS.primary }}>Sign Up</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
