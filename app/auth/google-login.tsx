import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../../constants/theme';
import { PublicRoute } from '../../components/PublicRoute';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import {
    GoogleSignin,
    isSuccessResponse,
    isErrorWithCode,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import { useAnalytics } from '../../hooks/useAnalytics';
import { analyticsService } from '../../utils/analytics';

export default function GoogleLogin() {
    useAnalytics('GoogleLoginScreen');
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLanguage();
    const { showToast } = useToast();
    const { googleLogin } = useAuth();

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            GoogleSignin.signOut();

            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            if (isSuccessResponse(userInfo)) {
                try {
                    const { idToken, user } = userInfo.data;
                    if (idToken) {
                        await googleLogin(idToken, user);
                        showToast(t('loginSuccess'), 'success');
                        router.replace('/(tabs)');
                    } else {
                        // Log analytics event for failed Google Sign-In (no token)
                        analyticsService.logEvent('google_signin_failed', { reason: 'no_id_token' });
                        showToast(t('googleSignInErrorsNoIdToken') || 'No ID token received', 'error');
                    }
                } catch (error: any) {
                    // Log analytics event for failed Google -In (backend/context error)
                    analyticsService.logEvent('google_signin_failed', { reason: 'backend_error', message: error?.message });
                    console.error('Google login error:', error);
                    showToast(t('googleSignInErrorsUnknownError'), 'error');
                }
            } else {
                // Log analytics event for failed Google Sign-In (cancelled)
                analyticsService.logEvent('google_signin_failed', { reason: 'cancelled_by_user' });
                showToast(t('googleSignInErrorsSignInCancelled'), 'error');
            }
        } catch (error) {
            // Log analytics event for failed Google Sign-In (native error)
            let reason = 'unknown_native_error';
            if (isErrorWithCode(error)) {
                reason = error.code;
                switch (error.code) {
                    case statusCodes.IN_PROGRESS:
                        showToast(t('googleSignInErrorsInProgress'), 'error');
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        showToast(t('googleSignInErrorsPlayServicesNotAvailable'), 'error');
                        break;
                    case statusCodes.SIGN_IN_CANCELLED:
                        showToast(t('googleSignInErrorsSignInCancelled'), 'error');
                        break;
                    default:
                        showToast(t('googleSignInErrorsUnknownError'), 'error');
                }
            } else {
                showToast(t('googleSignInErrorsNotRelatedToGoogleSignIn'), 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PublicRoute>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1 bg-white"
                style={{ backgroundColor: COLORS.background.primary || COLORS.white }}
            >
                <ScrollView
                    className="flex-1 px-6 pt-10 pb-8"
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo and Header */}
                    <View className="items-center mb-6">
                        <Image
                            source={require('../../assets/hirabook-logo.png')}
                            className="w-[240px] h-[144px]"
                            style={{ resizeMode: 'contain' }}
                        />
                    </View>

                    {/* Welcome Message */}
                    <View className="items-center mb-8">
                        <Text className="text-3xl font-bold text-center" style={{ color: COLORS.secondary }}>
                            {t('welcomeBack')}
                        </Text>
                        <Text className="text-base text-center mt-2" style={{ color: COLORS.gray[600] }}>
                            {t('loginToContinue')}
                        </Text>
                    </View>

                    {/* Login Illustration */}
                    <View className="items-center mb-10">
                        <Image
                            source={require('../../assets/login-illustration.jpg')}
                            className="w-[220px] h-[180px]"
                            style={{ resizeMode: 'contain' }}
                        />
                    </View>

                    {/* Google Sign In Button */}
                    <Pressable
                        onPress={handleGoogleSignIn}
                        disabled={isLoading}
                        className={`flex-row items-center justify-center py-4 px-5 rounded-xl mb-3 ${isLoading ? 'opacity-70' : ''}`}
                        style={{
                            backgroundColor: '#4285F4',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                        android_ripple={{ color: '#3367D6' }}
                    >
                        <View className="bg-white p-1.5 rounded-full mr-4">
                            <Image
                                source={require('../../assets/google-icon.png')}
                                className="w-6 h-6"
                                style={{ resizeMode: 'contain' }}
                            />
                        </View>
                        <Text className="text-white text-base font-semibold">
                            {t('signInWithGoogle')}
                        </Text>
                    </Pressable>

                    {/* Made with love footer */}
                    <View className="items-center mt-8">
                        <Text className="text-xs" style={{ color: COLORS.gray[400] }}>
                            {t('madeWith')} ❤️ {t('by')} Hirabook
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </PublicRoute>
    );
}
