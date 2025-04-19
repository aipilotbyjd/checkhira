import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useLanguage } from '../../contexts/LanguageContext';

export default function LanguageSettings() {
    const { locale, setLocale, availableLocales, t } = useLanguage();
    const [isChanging, setIsChanging] = useState(false);

    const handleChangeLanguage = async (code: string) => {
        setIsChanging(true);
        try {
            await setLocale(code);
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

                <View>
                    {availableLocales.map((lang) => (
                        <Pressable
                            key={lang.code}
                            onPress={() => handleChangeLanguage(lang.code)}
                            disabled={isChanging || locale === lang.code}
                            className="mb-3 flex-row items-center justify-between rounded-xl border p-3"
                            style={{
                                borderColor: locale === lang.code ? COLORS.primary : COLORS.gray[200],
                                backgroundColor: locale === lang.code ? COLORS.primary + '15' : COLORS.background.primary,
                            }}
                        >
                            <View className="flex-row items-center flex-1">
                                <View className="p-2 rounded-lg" style={{ backgroundColor: locale === lang.code ? COLORS.primary + '30' : COLORS.background.primary }}>
                                    <MaterialCommunityIcons
                                        name="translate"
                                        size={22}
                                        color={locale === lang.code ? COLORS.primary : COLORS.secondary}
                                    />
                                </View>
                                <Text
                                    className="ml-3 text-base font-medium flex-1"
                                    style={{ color: locale === lang.code ? COLORS.primary : COLORS.secondary }}
                                    numberOfLines={1}
                                >
                                    {lang.name}
                                </Text>
                            </View>
                            {locale === lang.code && (
                                <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.primary} />
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