import { Text, View, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { Link } from 'expo-router';

export default function Account() {
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
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      {/* Profile Section */}
      <View className="items-center px-6 pt-8">
        <View className="h-24 w-24 rounded-full bg-gray-200">
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            className="h-full w-full rounded-full"
          />
        </View>
        <Text className="mt-4 text-xl font-semibold" style={{ color: COLORS.secondary }}>
          John Doe
        </Text>
        <Text className="text-sm" style={{ color: COLORS.gray[400] }}>
          john.doe@example.com
        </Text>
      </View>

      {/* Menu Items */}
      <View className="mt-8 px-6">
        {menuItems.map((item, index) => (
          <Link key={item.href} href={item.href} asChild>
            <TouchableOpacity
              className="mb-4 flex-row items-center rounded-2xl p-4"
              style={{ backgroundColor: COLORS.background.secondary }}>
              <MaterialCommunityIcons name={item.icon} size={24} color={COLORS.primary} />
              <Text className="ml-3 flex-1 text-base" style={{ color: COLORS.gray[600] }}>
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      {/* Logout Button */}
      <View className="mt-auto p-6">
        <TouchableOpacity
          className="flex-row items-center justify-center rounded-2xl p-4"
          style={{ backgroundColor: COLORS.error + '15' }}>
          <MaterialCommunityIcons name="logout" size={24} color={COLORS.error} />
          <Text className="ml-2 text-base font-semibold" style={{ color: COLORS.error }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
