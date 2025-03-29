import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { PublicRoute } from '../../components/PublicRoute';
import { AuthHeader } from '../../components/AuthHeader';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import {
    GoogleSignin,
    isSuccessResponse,
    isErrorWithCode,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import { SocialLoginButton } from '../../components/SocialLoginButton';

export default function GoogleLogin() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLanguage();
    const { showToast } = useToast();
    const { googleLogin } = useAuth();

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            if (isSuccessResponse(userInfo)) {
                const { idToken, user } = userInfo.data;
                const { name, email, photo } = user;

                // Call the googleLogin method from AuthContext
                await googleLogin(idToken, user);
                showToast(t('loginSuccess'), 'success');
                router.replace('/(tabs)');
            } else {
                // sign in was cancelled by user
                showToast(t('googleSignInErrorsSignInCancelled'), 'error')
            }
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.IN_PROGRESS:
                        // operation (eg. sign in) already in progress
                        showToast(t('googleSignInErrorsInProgress'), 'error')

                        //after 2 seconds
                        setTimeout(() => {
                            setIsLoading(false);
                        }, 2000);
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        // Android only, play services not available or outdated
                        showToast(t('googleSignInErrorsPlayServicesNotAvailable'), 'error')

                        //after 2 seconds
                        setTimeout(() => {
                            setIsLoading(false);
                        }, 2000);
                        break;
                    default:
                        // some other error happened
                        showToast(t('googleSignInErrorsUnknownError'), 'error')

                        //after 2 seconds
                        setTimeout(() => {
                            setIsLoading(false);
                        }, 2000);
                }
            } else {
                // an error that's not related to google sign in occurred
                showToast(t('googleSignInErrorsNotRelatedToGoogleSignIn'), 'error')

                //after 2 seconds
                setTimeout(() => {
                    setIsLoading(false);
                }, 2000);
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
            >
                <AuthHeader
                    title={t('welcomeBack')}
                    subtitle={t('loginToContinue')}
                    showBack={true}
                />

                <ScrollView className="px-6" keyboardShouldPersistTaps="handled">
                    <View className="items-center mb-8">
                        <Image
                            source={require('../../assets/google-login.png')}
                            style={{ width: 150, height: 150, resizeMode: 'contain' }}
                        />
                        <Text className="text-lg text-center mt-4" style={{ color: COLORS.gray[600] }}>
                            {t('loginToContinue')}
                        </Text>
                    </View>

                    <SocialLoginButton
                        icon="google"
                        label={t('signInWithGoogle')}
                        onPress={handleGoogleSignIn}
                        disabled={isLoading}
                    />

                    {isLoading && (
                        <View className="items-center mt-4">
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    )}

                    <View className="flex-row items-center my-6">
                        <View className="flex-1 h-px bg-gray-200" />
                        <Text className="px-4 text-sm" style={{ color: COLORS.gray[400] }}>
                            OR
                        </Text>
                        <View className="flex-1 h-px bg-gray-200" />
                    </View>

                    <Pressable
                        onPress={() => router.push('/auth/phone-login')}
                        className="rounded-xl border p-4 mb-4"
                        style={{ borderColor: COLORS.primary }}
                    >
                        <Text className="text-center text-lg font-semibold" style={{ color: COLORS.primary }}>
                            {t('continueWithPhone')}
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => router.push('/auth/email-login')}
                        className="rounded-xl border p-4 mb-6"
                        style={{ borderColor: COLORS.primary }}
                    >
                        <Text className="text-center text-lg font-semibold" style={{ color: COLORS.primary }}>
                            {t('continueWithEmail')}
                        </Text>
                    </Pressable>

                    <View className="flex-row justify-center mt-8">
                        <Text className="text-sm" style={{ color: COLORS.gray[600] }}>
                            {t('dontHaveAccount')}{' '}
                        </Text>
                        <Pressable onPress={() => router.push('/auth/register')}>
                            <Text className="text-sm font-semibold" style={{ color: COLORS.primary }}>
                                {t('register')}
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </PublicRoute>
    );
}
