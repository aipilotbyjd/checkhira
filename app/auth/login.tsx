import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { AuthHeader } from '../../components/AuthHeader';
import { SocialLoginButton } from '../../components/SocialLoginButton';
import AuthPhoneInput from '../../components/AuthPhoneInput';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';
import { authService } from '../../services/authService';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  // Initialize Google Auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '<YOUR_EXPO_CLIENT_ID>',
    iosClientId: '<YOUR_IOS_CLIENT_ID>',
    androidClientId: '<YOUR_ANDROID_CLIENT_ID>',
    webClientId: '<YOUR_WEB_CLIENT_ID>',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      // Fetch user data from your backend using the Google token
      handleGoogleLogin(authentication.accessToken);
    }
  }, [response]);

  const handleGoogleLogin = async (accessToken: string) => {
    try {
      const res = await authService.googleLogin(accessToken);
      if (res.status) {
        await login(res.data);
        router.push('/(tabs)');
      } else {
        Alert.alert('Error', res.message || 'Failed to login with Google');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login with Google. Please try again.');
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1">
        <AuthHeader
          title="Welcome Back!"
          subtitle="Sign in with your phone number to continue"
          showBack={false}
        />

        <View className="px-6">
          <AuthPhoneInput
            onPhoneSubmit={(phone) => router.push(`/auth/verify-otp?phone=${phone}`)}
          />

          <View className="mb-6 flex-row items-center">
            <View className="flex-1 border-t" style={{ borderColor: COLORS.gray[200] }} />
            <Text className="mx-4 text-sm" style={{ color: COLORS.gray[400] }}>
              Or continue with
            </Text>
            <View className="flex-1 border-t" style={{ borderColor: COLORS.gray[200] }} />
          </View>

          {/* Google Login Button */}
          <SocialLoginButton
            icon="google"
            label="Continue with Google"
            onPress={() => {
              promptAsync();
            }}
          />

          {/* Email Login Button */}
          <SocialLoginButton
            icon="email"
            label="Continue with Email"
            onPress={() => router.push('/auth/email-login')}
          />

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
