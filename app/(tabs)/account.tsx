import { View, Text, TouchableOpacity, Image, Pressable, Alert, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { SuccessModal } from '../../components/SuccessModal';
import { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { notificationService } from '../../services/notificationService';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProfileOperations } from '../../hooks/useProfileOperations';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Account() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { showToast } = useToast();
  const { refreshUnreadCount } = useNotification();
  const { isAuthenticated, logout } = useAuth();
  const { getProfile, updateProfile } = useProfileOperations();
  const { t, loading } = useLanguage();
  const [user, setUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    profile_image: '',
  });

  const refreshUser = async () => {
    try {
      const userData = await getProfile();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      showToast('Failed to refresh user data', 'error');
    }
  };

  useEffect(() => {
    refreshUnreadCount
  }, []);

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
        await Promise.all([
          refreshUser(),
        ]);
      }
    };
    init();
  }, [isAuthenticated]);

  const menuItems = [
    {
      title: t('editProfile'),
      icon: 'account-edit',
      href: '/account/edit-profile',
    },
    {
      title: t('defaultPrices'),
      icon: 'diamond-stone',
      href: '/account/default-prices',
    },
    {
      title: t('termsAndConditions'),
      icon: 'file-document',
      href: '/account/terms',
    },
    {
      title: t('privacyPolicy'),
      icon: 'shield-lock',
      href: '/account/privacy',
    },
    {
      title: t('languageSettings'),
      icon: 'translate',
      href: '/account/language',
    },
    // {
    //   title: t('themeSettings'),
    //   icon: 'theme-light-dark',
    //   href: '/account/theme',
    // },
    {
      title: t('aboutApp'),
      icon: 'information',
      href: '/account/about',
    },
  ];

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: COLORS.background.primary }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 20 }}
    >
      {!isAuthenticated ? (
        <View className="flex-1 justify-center py-12">
          <View className="items-center">
            <MaterialCommunityIcons name="account-circle" size={80} color={COLORS.gray[400]} />
            <Text className="mt-4 text-xl font-semibold" style={{ color: COLORS.secondary }}>
              {t('welcomeBack')}
            </Text>
            <Text className="mt-2 text-center text-base" style={{ color: COLORS.gray[400] }}>
              {t('loginToContinue')}
            </Text>
          </View>

          <View className="space-y-4 mt-6">
            <Link href="/auth/phone-login" asChild>
              <Pressable className="rounded-xl p-4" style={{ backgroundColor: COLORS.primary }}>
                <Text className="text-center text-lg font-semibold text-white">{t('login')}</Text>
              </Pressable>
            </Link>

            <Link href="/auth/register" asChild>
              <Pressable className="rounded-xl border p-4" style={{ borderColor: COLORS.primary }}>
                <Text className="text-center text-lg font-semibold" style={{ color: COLORS.primary }}>
                  {t('createAccount')}
                </Text>
              </Pressable>
            </Link>

            <Link href="/auth/google-login" asChild>
              <Pressable
                className="rounded-xl p-4 mt-4"
                style={{ backgroundColor: '#4285F4' }}
              >
                <Text className="text-center text-lg font-semibold text-white">
                  {t('signInWithGoogle')}
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      ) : (
        <View className="min-h-full pb-4">
          {/* Profile Section */}
          <View className="items-center pt-8">
            <View className="h-24 w-24 rounded-full bg-gray-200">
              <Image
                source={
                  typeof user.profile_image === 'string'
                    ? { uri: user.profile_image }
                    : require('../../assets/profile_image.jpg')
                }
                className="h-24 w-24 rounded-full"
                style={{ width: '100%', height: '100%' }}
              />
            </View>
            <Text className="mt-4 text-xl font-semibold" style={{ color: COLORS.secondary }}>
              {user.first_name} {user.last_name}
            </Text>
            <Text className="text-sm" style={{ color: COLORS.gray[400] }}>
              {user.email}
            </Text>
          </View>

          {/* Menu Items - Improved for better mobile display */}
          <View className="mt-6 px-1">
            {menuItems.map((item, index) => (
              <Link key={index} href={item.href as any} asChild>
                <Pressable
                  className="mb-3 flex-row items-center justify-between rounded-xl border p-3"
                  style={{
                    borderColor: COLORS.gray[200],
                    backgroundColor: COLORS.background.primary,
                  }}>
                  <View className="flex-row items-center flex-1">
                    <View className="p-2 rounded-lg" style={{ backgroundColor: COLORS.primary + '15' }}>
                      <MaterialCommunityIcons name={item.icon as any} size={22} color={COLORS.primary} />
                    </View>
                    <Text
                      className="ml-3 text-base font-medium flex-1"
                      style={{ color: COLORS.secondary }}
                      numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.gray[400]} />
                </Pressable>
              </Link>
            ))}
          </View>

          <View className="mt-8 mb-4">
            <Pressable
              onPress={() => {
                Alert.alert(
                  t('logout'),
                  t('logoutConfirmation'),
                  [
                    {
                      text: t('cancel'),
                      style: 'cancel',
                    },
                    {
                      text: t('logout'),
                      style: 'destructive',
                      onPress: async () => {
                        await logout();
                        showToast(t('logoutSuccess'));
                      },
                    },
                  ]
                );
              }}
              className="rounded-2xl p-4"
              style={{ backgroundColor: COLORS.error }}>
              <Text className="text-center text-lg font-semibold text-white">{t('logout')}</Text>
            </Pressable>
          </View>

          <SuccessModal
            visible={showSuccessModal}
            onClose={async () => {
              setShowSuccessModal(false);
              await refreshUser();
              router.back();
            }}
            message={t('profileUpdatedSuccess')}
          />
        </View>
      )}
    </ScrollView>
  );
}
