import { Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface SocialLoginButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

export function SocialLoginButton({ icon, label, onPress }: SocialLoginButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-4 flex-row items-center justify-center rounded-xl border p-3"
      style={{ borderColor: COLORS.gray[200] }}>
      <MaterialCommunityIcons name={icon as any} size={24} color={COLORS.secondary} />
      <Text className="ml-3 text-base font-medium" style={{ color: COLORS.secondary }}>
        {label}
      </Text>
    </Pressable>
  );
}
