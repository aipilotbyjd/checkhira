import { Text, View, ScrollView } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function Privacy() {
  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="px-6 pt-8">
        <Text className="mb-6 text-2xl font-semibold" style={{ color: COLORS.secondary }}>
          Privacy Policy
        </Text>

        <View className="space-y-6">
          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              Information Collection
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              We collect information that you provide directly to us, including your name, email
              address, and any other information you choose to provide.
            </Text>
          </View>

          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              How We Use Your Information
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              We use the information we collect to provide, maintain, and improve our services,
              communicate with you, and protect our services and users.
            </Text>
          </View>

          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              Data Security
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              We implement appropriate security measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction.
            </Text>
          </View>

          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              Your Rights
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              You have the right to access, update, or delete your personal information at any time.
              You can do this through your account settings or by contacting us directly.
            </Text>
          </View>

          <View>
            <Text className="mt-4 text-base italic" style={{ color: COLORS.gray[400] }}>
              Last updated: January 1, 2024
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
