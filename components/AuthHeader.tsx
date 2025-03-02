import { View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export function AuthHeader({ title, subtitle, showBack = true }: AuthHeaderProps) {
  const router = useRouter();

  return (
    <View className="px-6 pb-6 pt-12">
      {/* Logo Section */}
      <View className="mb-6 items-center">
        <Image
          source={require('../assets/hirabook-logo.png')}
          style={{
            width: SIZES.h1 * 10, // 64 on most devices
            height: SIZES.h1 * 6,    // 32 on most devices
            resizeMode: 'contain'
          }}
        />
      </View>

      {showBack && (
        <Pressable
          onPress={() => router.back()}
          className="mb-6 h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: COLORS.gray[100] }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </Pressable>
      )}
      <Text className="text-3xl font-bold" style={{ color: COLORS.secondary }}>
        {title}
      </Text>
      {subtitle && (
        <Text className="mt-2 text-base" style={{ color: COLORS.gray[400] }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
