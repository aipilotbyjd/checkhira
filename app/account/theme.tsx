import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function ThemeSettings() {
  const { themeMode, setThemeMode, isDark } = useTheme();
  const { t } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const themeOptions = [
    { key: 'light', label: t('lightTheme'), icon: 'weather-sunny' },
    { key: 'dark', label: t('darkTheme'), icon: 'weather-night' },
    { key: 'system', label: t('systemTheme'), icon: 'theme-light-dark' },
  ];

  const handleChangeTheme = async (mode: 'light' | 'dark' | 'system') => {
    setIsChanging(true);
    try {
      await setThemeMode(mode);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <View className="p-6">
        <Text className="mb-6 text-lg font-semibold" style={{ color: COLORS.secondary }}>
          {t('selectTheme')}
        </Text>

        <View>
          {themeOptions.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => handleChangeTheme(option.key as 'light' | 'dark' | 'system')}
              disabled={isChanging || themeMode === option.key}
              className="mb-3 flex-row items-center justify-between rounded-xl border p-3"
              style={{
                borderColor: themeMode === option.key ? COLORS.primary : COLORS.gray[200],
                backgroundColor: themeMode === option.key ? COLORS.primary + '15' : COLORS.background.primary,
              }}
            >
              <View className="flex-row items-center flex-1">
                <View className="p-2 rounded-lg" style={{ backgroundColor: themeMode === option.key ? COLORS.primary + '30' : COLORS.background.primary }}>
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={22}
                    color={themeMode === option.key ? COLORS.primary : COLORS.secondary}
                  />
                </View>
                <Text
                  className="ml-3 text-base font-medium flex-1"
                  style={{ color: themeMode === option.key ? COLORS.primary : COLORS.secondary }}
                  numberOfLines={1}
                >
                  {option.label}
                </Text>
              </View>
              {themeMode === option.key && (
                <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.primary} />
              )}
            </Pressable>
          ))}
        </View>

        <Text className="mt-6 text-sm" style={{ color: COLORS.gray[400] }}>
          {t('themeChangeInfo')}
        </Text>
      </View>
    </ScrollView>
  );
} 