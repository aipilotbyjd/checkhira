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
                try {
                    const { idToken, user } = userInfo.data;
                    const { name, email, photo } = user;

                    if (idToken) {
                        await googleLogin(idToken, user);
                        showToast(t('loginSuccess'), 'success');
                        router.replace('/(tabs)');
                    } else {
                        showToast(t('googleSignInErrorsNoIdToken') || 'No ID token received', 'error');
                    }
                } catch (error) {
                    console.error('Google login error:', error);
                    showToast(t('googleSignInErrorsUnknownError'), 'error');
                }
            } else {
                showToast(t('googleSignInErrorsSignInCancelled'), 'error');
            }
        } catch (error) {
            if (isErrorWithCode(error)) {
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
                            style={{ width: 180, height: 180, resizeMode: 'contain' }}
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
                </ScrollView>
            </KeyboardAvoidingView>
        </PublicRoute>
    );
}
