import { Text, View, Image, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { environment } from '~/config/environment';
import { useLanguage } from '../../contexts/LanguageContext';
import Constants from 'expo-constants';

export default function About() {
  const { t } = useLanguage();

  const socialLinks = [
    {
      icon: 'web',
      url: environment.websiteUrl,
      label: t('website'),
    },
    {
      icon: 'twitter',
      url: environment.twitterUrl,
      label: 'Twitter',
    },
    {
      icon: 'instagram',
      url: environment.instagramUrl,
      label: 'Instagram',
    },
    {
      icon: 'facebook',
      url: environment.facebookUrl,
      label: 'Facebook',
    },
    {
      icon: 'linkedin',
      url: environment.linkedinUrl,
      label: 'LinkedIn',
    },
  ].filter(link => link.url); // Filter out links with undefined URLs

  const appFeatures = [
    {
      icon: 'chart-line',
      title: t('workTracking'),
      description: t('workTrackingDesc'),
    },
    {
      icon: 'cash',
      title: t('paymentManagement'),
      description: t('paymentManagementDesc'),
    },
    {
      icon: 'account-group',
      title: t('userFriendly'),
      description: t('userFriendlyDesc'),
    },
  ];

  const handleContact = () => {
    Linking.openURL(`mailto:${environment.supportEmail}`);
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <View className="px-6 pt-8">
        <View className="items-center">
          <Image source={require('../../assets/icon.png')} className="mb-4 h-24 w-24 rounded-2xl" />
          <Text className="text-2xl font-semibold" style={{ color: COLORS.secondary }}>
            {environment.appName}
          </Text>
          <Text className="mb-4 text-sm" style={{ color: COLORS.gray[400] }}>
            Version {environment.appVersion}
          </Text>
        </View>

        <View className="mt-8 space-y-4">
          <Text className="text-center text-base leading-6" style={{ color: COLORS.gray[600] }}>
            {t('appDescription')}
          </Text>

          {/* Features Section */}
          <View className="mt-8">
            <Text className="mb-4 text-lg font-semibold text-center" style={{ color: COLORS.secondary }}>
              {t('keyFeatures')}
            </Text>

            {appFeatures.map((feature, index) => (
              <View key={index} className="mb-4 flex-row">
                <View className="w-10 items-center mt-1">
                  <MaterialCommunityIcons name={feature.icon as any} size={24} color={COLORS.primary} />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="font-semibold" style={{ color: COLORS.secondary }}>
                    {feature.title}
                  </Text>
                  <Text className="text-sm mt-1" style={{ color: COLORS.gray[600] }}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View
            className="mt-6 rounded-2xl bg-gray-50 p-4"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <Text className="mb-3 text-base font-semibold" style={{ color: COLORS.secondary }}>
              {t('connectWithUs')}
            </Text>
            <View className="flex-row flex-wrap justify-around">
              {socialLinks.map((link, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => Linking.openURL(link.url)}
                  className="items-center mb-3 mx-2">
                  <MaterialCommunityIcons name={link.icon as any} size={24} color={COLORS.primary} />
                  <Text className="mt-1 text-sm" style={{ color: COLORS.gray[600] }}>
                    {link.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleContact}
            className="mt-6 rounded-xl p-4 items-center"
            style={{ backgroundColor: COLORS.primary + '15' }}>
            <Text className="font-semibold" style={{ color: COLORS.primary }}>
              {t('contactSupport')}
            </Text>
          </TouchableOpacity>

          <View className="mt-6">
            <Text className="text-center text-sm" style={{ color: COLORS.gray[400] }}>
              {t('madeWith')} ❤️ {t('by')} Hirabook
            </Text>
            <Text className="mt-1 text-center text-sm" style={{ color: COLORS.gray[400] }}>
              © {new Date().getFullYear()} {t('allRightsReserved')}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
