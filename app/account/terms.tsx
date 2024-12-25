import { Text, View, ScrollView } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function Terms() {
  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="px-6 pt-8">
        <Text className="mb-6 text-2xl font-semibold" style={{ color: COLORS.secondary }}>
          Terms & Conditions
        </Text>

        <View className="space-y-6">
          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              1. Acceptance of Terms
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              By accessing and using this application, you accept and agree to be bound by the terms
              and provision of this agreement.
            </Text>
          </View>

          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              2. Use License
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              Permission is granted to temporarily download one copy of the application for
              personal, non-commercial transitory viewing only.
            </Text>
          </View>

          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              3. Disclaimer
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              The materials on this application are provided on an 'as is' basis. We make no
              warranties, expressed or implied, and hereby disclaim and negate all other warranties
              including, without limitation, implied warranties or conditions of merchantability.
            </Text>
          </View>

          <View>
            <Text className="mb-2 text-lg font-semibold" style={{ color: COLORS.secondary }}>
              4. Limitations
            </Text>
            <Text className="text-base leading-6" style={{ color: COLORS.gray[600] }}>
              In no event shall we or our suppliers be liable for any damages arising out of the use
              or inability to use the materials on our application.
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
