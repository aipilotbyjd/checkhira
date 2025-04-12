
import { View, Text, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useLanguage } from '../contexts/LanguageContext';

export const OfflineScreen = () => {
  const { t } = useLanguage();
  
  return (
    <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: COLORS.background.primary }}>
      <View className="items-center">
        <MaterialCommunityIcons 
          name="wifi-off" 
          size={80} 
          color={COLORS.primary} 
        />
        <Text 
          className="mt-6 text-2xl font-bold text-center" 
          style={{ color: COLORS.secondary }}
        >
          {t('noInternet')}
        </Text>
        <Text 
          className="mt-3 text-base text-center" 
          style={{ color: COLORS.gray[400] }}
        >
          {t('checkConnection')}
        </Text>
      </View>
    </View>
  );
};
