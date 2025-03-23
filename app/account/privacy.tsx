import { Text, View, ScrollView } from 'react-native';
import { COLORS } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Privacy() {
  const { t } = useLanguage();

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="px-6 pt-8">
        <Text className="mb-6 text-2xl font-semibold" style={{ color: COLORS.secondary }}>
          {t('privacyPolicy')}
        </Text>

        <View className="space-y-6">
          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              {t('informationCollection')}
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              {t('informationCollectionDesc')}
            </Text>
          </View>

          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              {t('howWeUseYourInformation')}
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              {t('howWeUseYourInformationDesc')}
            </Text>
          </View>

          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              {t('dataSecurity')}
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              {t('dataSecurityDesc')}
            </Text>
          </View>

          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              {t('yourRights')}
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              {t('yourRightsDesc')}
            </Text>
          </View>

          <View>
            <Text className="mt-4 text-base italic" style={{ color: COLORS.gray[400] }}>
              {t('lastUpdated')}: {t('privacyLastUpdatedDate')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
