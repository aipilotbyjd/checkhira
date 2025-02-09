import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { AuthHeader } from '../../components/AuthHeader';
import { SocialLoginButton } from '../../components/SocialLoginButton';
import AuthPhoneInput from '../../components/AuthPhoneInput';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';
import { authService } from '../../services/authService';
import { environment } from '../../config/environment';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      // Configure before sign in (can move to _layout.tsx if not already there)
      GoogleSignin.configure({
        webClientId: environment.webClientId,
        iosClientId: environment.iosClientId,
        offlineAccess: true,
      });

      console.log('Google Sign-In Configured with:', {
        webClientId: environment.webClientId,
        iosClientId: environment.iosClientId,
        androidClientId: environment.androidClientId
      });

      // Check play services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign out first to ensure clean state
      await GoogleSignin.signOut();

      // Sign in
      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In Success:', userInfo); // Debug log

      if (userInfo.idToken) {
        // Send token to backend
        const response = await authService.googleLogin(userInfo.idToken);
        console.log('Backend Response:', response); // Debug log

        if (response.status) {
          await login(response.data);
          router.push('/(tabs)');
        } else {
          Alert.alert('Error', response.message || 'Failed to login with Google');
        }
      }
    } catch (error: any) {
      console.error('Detailed Google Sign-In Error:', error); // Detailed error logging
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the sign-in flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Error', 'Sign in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Play services not available or outdated');
      } else {
        Alert.alert('Error', 'Failed to login with Google. Please try again.');
      }
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
            onPress={handleGoogleSignIn}
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
