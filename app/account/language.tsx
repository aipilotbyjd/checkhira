import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';

export default function LanguageSettings() {
    const { locale, setLocale, availableLocales, t } = useLanguage();
    const { trackEvent } = useAnalytics();
    const [isChanging, setIsChanging] = useState(false);

    const handleChangeLanguage = async (code: string) => {
        setIsChanging(true);
        try {
            await setLocale(code);
            trackEvent('change_language', { language: code });
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
            <View className="p-6">
                <Text className="mb-6 text-lg font-semibold" style={{ color: COLORS.secondary }}>
                    {t('selectLanguage')}
                </Text>

                <View className="space-y-3">
                    {availableLocales.map((lang) => (
                        <Pressable
                            key={lang.code}
                            onPress={() => handleChangeLanguage(lang.code)}
                            disabled={isChanging || locale === lang.code}
                            className={`flex-row items-center justify-between rounded-xl border p-4 ${locale === lang.code ? 'border-primary' : 'border-gray-200'
                                }`}
                            style={{
                                backgroundColor: locale === lang.code ? COLORS.primary + '15' : COLORS.white,
                                opacity: isChanging ? 0.7 : 1,
                            }}
                        >
                            <Text
                                className="text-base"
                                style={{ color: locale === lang.code ? COLORS.primary : COLORS.secondary }}
                            >
                                {lang.name}
                            </Text>
                            {locale === lang.code && (
                                <MaterialCommunityIcons name="check" size={20} color={COLORS.primary} />
                            )}
                        </Pressable>
                    ))}
                </View>

                <Text className="mt-6 text-sm" style={{ color: COLORS.gray[400] }}>
                    {t('languageChangeInfo')}
                </Text>
            </View>
        </ScrollView>
    );
} 