import { View, Text, TouchableOpacity, Image, Pressable, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { SuccessModal } from '../../components/SuccessModal';
import { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { notificationService } from '../../services/notificationService';
import { useNotification } from '../../contexts/NotificationContext';

export default function Account() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { showToast } = useToast();
  const { setUnreadCount } = useNotification();

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
            <Text className="text-center text-lg font-semibold" style={{ color: COLORS.primary }}>
              Create Account
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      {/* Profile Section */}
      <View className="items-center px-6 pt-8">
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

      {/* Menu Items */}
      <View className="mt-8 px-6">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href as any} asChild>
            <TouchableOpacity
              className="mb-4 flex-row items-center rounded-2xl p-4"
              style={{ backgroundColor: COLORS.background.secondary }}>
              <MaterialCommunityIcons name={item.icon as any} size={24} color={COLORS.primary} />
              <Text className="ml-3 flex-1 text-base" style={{ color: COLORS.gray[600] }}>
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
            </TouchableOpacity>
          </Link>
        ))}

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          className="mt-4 rounded-2xl p-4"
          style={{ backgroundColor: COLORS.error }}>
          <Text className="text-center text-lg font-semibold text-white">Logout</Text>
        </Pressable>
      </View>

      <SuccessModal
        visible={showSuccessModal}
        onClose={async () => {
          setShowSuccessModal(false);
          await refreshUser();
          router.back();
        }}
        message="Profile updated successfully!"
      />
    </View>
  );
}
