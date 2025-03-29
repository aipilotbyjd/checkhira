import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Image,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../../constants/theme';
import { PublicRoute } from '../../components/PublicRoute';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
    GoogleSignin,
    isSuccessResponse,
    isErrorWithCode,
    statusCodes,
} from '@react-native-google-signin/google-signin';

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
                className="flex-1"
                style={{ backgroundColor: COLORS.background.primary || COLORS.white }}
            >
                <ScrollView
                    className="flex-1"
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Logo and Header */}
                    <View className="items-center">
                        <Image
                            source={require('../../assets/hirabook-logo.png')}
                            style={styles.logo}
                        />
                    </View>

                    {/* Welcome Message */}
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeText}>{t('welcomeBack')}</Text>
                        <Text style={styles.subtitleText}>{t('loginToContinue')}</Text>
                    </View>

                    {/* Login Illustration */}
                    <View className="items-center my-8">
                        <Image
                            source={require('../../assets/login-illustration.jpg')}
                            style={styles.illustration}
                        />
                    </View>

                    {/* Google Sign In Button */}
                    <Pressable
                        onPress={handleGoogleSignIn}
                        disabled={isLoading}
                        style={[styles.googleButton, isLoading && styles.disabledButton]}
                        android_ripple={{ color: '#3367D6' }}
                    >
                        <Image
                            source={require('../../assets/google-icon.png')}
                            style={styles.googleIcon}
                        />
                        <Text style={styles.buttonText}>
                            {t('signInWithGoogle')}
                        </Text>
                    </Pressable>

                    {/* Loading Indicator */}
                    {isLoading && (
                        <View className="items-center mt-4">
                            <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                    )}

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.divider} />
                    </View>

                    {/* Other Sign In Options */}
                    <Pressable
                        onPress={() => router.push('/auth/phone-login')}
                        style={styles.altLoginButton}
                        android_ripple={{ color: COLORS.gray[100] }}
                    >
                        <MaterialCommunityIcons name="phone" size={22} color={COLORS.primary} />
                        <Text style={styles.altLoginText}>{t('continueWithPhone')}</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => router.push('/auth/email-login')}
                        style={styles.altLoginButton}
                        android_ripple={{ color: COLORS.gray[100] }}
                    >
                        <MaterialCommunityIcons name="email" size={22} color={COLORS.primary} />
                        <Text style={styles.altLoginText}>{t('continueWithEmail')}</Text>
                    </Pressable>

                    {/* Register Link */}
                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>{t('dontHaveAccount')} </Text>
                        <Pressable onPress={() => router.push('/auth/register')}>
                            <Text style={styles.registerLink}>{t('createAccount')}</Text>
                        </Pressable>
                    </View>

                    {/* Made with love footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            {t('madeWith')} ❤️ {t('by')} Hirabook
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </PublicRoute>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 32,
    },
    logo: {
        width: SIZES.h1 * 10,
        height: SIZES.h1 * 6,
        resizeMode: 'contain',
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.secondary,
        textAlign: 'center',
    },
    subtitleText: {
        fontSize: 16,
        color: COLORS.gray[600],
        textAlign: 'center',
        marginTop: 8,
    },
    illustration: {
        width: 220,
        height: 180,
        resizeMode: 'contain',
    },
    googleButton: {
        backgroundColor: '#4285F4',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    disabledButton: {
        opacity: 0.7,
    },
    googleIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.gray[200],
    },
    dividerText: {
        paddingHorizontal: 16,
        color: COLORS.gray[400],
        fontSize: 14,
    },
    altLoginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray[200],
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginBottom: 12,
        backgroundColor: COLORS.white,
    },
    altLoginText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.primary,
        marginLeft: 12,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    registerText: {
        fontSize: 14,
        color: COLORS.gray[600],
    },
    registerLink: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: COLORS.gray[400],
    }
});
