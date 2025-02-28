import { View, Text, TouchableOpacity, Image, Pressable, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { SuccessModal } from '../../components/SuccessModal';
import { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { notificationService } from '../../services/notificationService';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

export default function Account() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { showToast } = useToast();
  const { setUnreadCount } = useNotification();
  const { isAuthenticated } = useAuth();

  const menuItems = [
    {
      title: 'Edit Profile',
      icon: 'account-edit',
      href: '/account/edit-profile',
    },
    {
      title: 'Terms & Conditions',
      icon: 'file-document',
      href: '/account/terms',
    },
    {
      title: 'Privacy Policy',
      icon: 'shield-lock',
      href: '/account/privacy',
    },
    {
      title: 'About App',
      icon: 'information',
      href: '/account/about',
    },
    {
      title: 'Default Prices',
      icon: 'diamond-stone',
      href: '/account/default-prices',
    },
  ];

  const getUnreadNotificationsCount = async () => {
    try {
      const response = await notificationService.getUnreadNotificationsCount();
      setUnreadCount(response.data as any);
    } catch (error) {
      showToast('Failed to get unread notifications count. Please try again.', 'error');
    }
  };

  useEffect(() => {
    const init = async () => {
      await getUnreadNotificationsCount();
    };
    init();
  }, []);

  return (
    <View className="flex-1 px-6" style={{ backgroundColor: COLORS.background.primary }}>
      {!isAuthenticated ? (
        <>
          <View className="items-center py-12">
            <MaterialCommunityIcons name="account-circle" size={80} color={COLORS.gray[400]} />
            <Text className="mt-4 text-xl font-semibold" style={{ color: COLORS.secondary }}>
              Welcome to the App
            </Text>
            <Text className="mt-2 text-center text-base" style={{ color: COLORS.gray[400] }}>
              Please login or create an account to access all features
            </Text>
          </View>

          <View className="space-y-4">
            <Link href="/auth/login" asChild>
              <Pressable className="rounded-xl p-4" style={{ backgroundColor: COLORS.primary }}>
                <Text className="text-center text-lg font-semibold text-white">Login</Text>
              </Pressable>
            </Link>

            <Link href="/auth/register" asChild>
              <Pressable className="rounded-xl border p-4" style={{ borderColor: COLORS.primary }}>
                <Text
                  className="text-center text-lg font-semibold"
                  style={{ color: COLORS.primary }}>
                  Create Account
                </Text>
              </Pressable>
            </Link>
          </View>
        </>
      ) : (
        <View>{/* Add authenticated user content */}</View>
      )}
    </View>
  );
}
