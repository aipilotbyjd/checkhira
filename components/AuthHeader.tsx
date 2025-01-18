import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export function AuthHeader({ title, subtitle, showBack = true }: AuthHeaderProps) {
  const router = useRouter();

  return (
    <View className="px-6 pb-6 pt-12">
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
