import { Text, View, ScrollView } from 'react-native';
import { COLORS } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Terms() {
  const { t } = useLanguage();
  
  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="px-6 pt-8">
        <Text className="mb-6 text-2xl font-semibold" style={{ color: COLORS.secondary }}>
          {t('termsAndConditions')}
        </Text>

        <View className="space-y-6">
          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              {t('termsAcceptance')}
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              {t('termsAcceptanceDesc')}
            </Text>
          </View>

          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              {t('termsUseLicense')}
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              {t('termsUseLicenseDesc')}
            </Text>
          </View>

          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              {t('termsDisclaimer')}
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              {t('termsDisclaimerDesc')}
            </Text>
          </View>

          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              {t('termsLimitations')}
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              {t('termsLimitationsDesc')}
            </Text>
          </View>

          <View>
            <Text className="mt-4 text-base italic" style={{ color: COLORS.gray[400] }}>
              {t('lastUpdated')}: {t('termsLastUpdatedDate')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
