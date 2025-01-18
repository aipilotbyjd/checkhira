import { View, Text, TextInput, TextInputProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface AuthInputProps extends TextInputProps {
  label: string;
  icon?: string;
  error?: string;
  required?: boolean;
}

export function AuthInput({ label, icon, error, required, ...props }: AuthInputProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
        {label} {required && <Text style={{ color: COLORS.error }}>*</Text>}
      </Text>
      <View className="relative">
        {icon && (
          <View className="absolute bottom-0 left-3 top-0 z-10 justify-center">
            <MaterialCommunityIcons name={icon as any} size={20} color={COLORS.gray[400]} />
          </View>
        )}
        <TextInput
          className="rounded-xl border p-3"
          style={{
            backgroundColor: COLORS.white,
            borderColor: error ? COLORS.error : COLORS.gray[200],
            color: COLORS.secondary,
            paddingLeft: icon ? 40 : 12,
          }}
          placeholderTextColor={COLORS.gray[400]}
          {...props}
        />
      </View>
      {error && (
        <Text className="mt-1 text-sm" style={{ color: COLORS.error }}>
          {error}
        </Text>
      )}
    </View>
  );
}
