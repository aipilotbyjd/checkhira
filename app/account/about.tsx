import { Text, View, Image, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function About() {
  const socialLinks = [
    {
      icon: 'web',
      url: 'https://yourwebsite.com',
      label: 'Website',
    },
    {
      icon: 'twitter',
      url: 'https://twitter.com/yourhandle',
      label: 'Twitter',
    },
    {
      icon: 'instagram',
      url: 'https://instagram.com/yourhandle',
      label: 'Instagram',
    },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <View className="px-6 pt-8">
        <View className="items-center">
          <Image source={require('../../assets/icon.png')} className="mb-4 h-24 w-24 rounded-2xl" />
          <Text className="text-2xl font-semibold" style={{ color: COLORS.secondary }}>
            Your App Name
          </Text>
          <Text className="mb-4 text-sm" style={{ color: COLORS.gray[400] }}>
            Version 1.0.0
          </Text>
        </View>

        <View className="mt-8 space-y-4">
          <Text className="text-center text-base leading-6" style={{ color: COLORS.gray[600] }}>
            Your app description goes here. Write about what makes your app special and what
            problems it solves for your users.
          </Text>

          <View
            className="mt-6 rounded-2xl bg-gray-50 p-4"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <Text className="mb-3 text-base font-semibold" style={{ color: COLORS.secondary }}>
              Connect With Us
            </Text>
            <View className="flex-row justify-around">
              {socialLinks.map((link, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => Linking.openURL(link.url)}
                  className="items-center">
                  <MaterialCommunityIcons name={link.icon} size={24} color={COLORS.primary} />
                  <Text className="mt-1 text-sm" style={{ color: COLORS.gray[600] }}>
                    {link.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-center text-sm" style={{ color: COLORS.gray[400] }}>
              Made with ❤��� by Your Company Name
            </Text>
            <Text className="mt-1 text-center text-sm" style={{ color: COLORS.gray[400] }}>
              © 2024 All rights reserved
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
