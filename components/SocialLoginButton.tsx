import { forwardRef } from 'react';
import { Pressable, Text, PressableProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface SocialLoginButtonProps extends PressableProps {
  icon: string;
  label: string;
}

export const SocialLoginButton = forwardRef<typeof Pressable, SocialLoginButtonProps>(
  ({ icon, label, ...props }, ref) => {
    return (
      <Pressable
        ref={ref as any}
        className="mb-4 flex-row items-center justify-center rounded-xl border p-4"
        style={{ borderColor: COLORS.gray[200] }}
        {...props}>
        <MaterialCommunityIcons name={icon as any} size={24} color={COLORS.gray[600]} />
        <Text className="ml-2 text-base font-semibold" style={{ color: COLORS.gray[600] }}>
          {label}
        </Text>
      </Pressable>
    );
  }
);

SocialLoginButton.displayName = 'SocialLoginButton';
