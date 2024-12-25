import { useState } from 'react';
import { Text, View, TextInput, Pressable, Image, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { SuccessModal } from '../../components/SuccessModal';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function EditProfile() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    address: '123 Main St, City, Country',
  });

  const handleSave = () => {
    if (!profile.name || !profile.email) {
      Alert.alert('Invalid Entry', 'Please fill in all required fields');
      return;
    }

    // TODO: Implement API call to update profile
    console.log('Updating profile:', profile);
    setShowSuccessModal(true);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1">
        {/* Profile Image Section */}
        <View className="items-center px-6 pt-6">
          <View className="relative">
            <View className="h-24 w-24 rounded-full bg-gray-200">
              <Image
                source={{ uri: 'https://via.placeholder.com/150' }}
                className="h-full w-full rounded-full"
              />
            </View>
            <Pressable
              className="absolute bottom-0 right-0 rounded-full p-2"
              style={{ backgroundColor: COLORS.primary }}>
              <MaterialCommunityIcons name="camera" size={20} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Form Fields */}
        <View className="mt-6 space-y-4 px-6">
          <View>
            <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
              Full Name <Text style={{ color: COLORS.error }}>*</Text>
            </Text>
            <TextInput
              className="rounded-xl border p-3"
              style={{
                backgroundColor: COLORS.white,
                borderColor: COLORS.gray[200],
                color: COLORS.secondary,
              }}
              placeholder="Enter your full name"
              value={profile.name}
              onChangeText={(text) => setProfile({ ...profile, name: text })}
            />
          </View>

          <View>
            <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
              Email Address <Text style={{ color: COLORS.error }}>*</Text>
            </Text>
            <TextInput
              className="rounded-xl border p-3"
              style={{
                backgroundColor: COLORS.white,
                borderColor: COLORS.gray[200],
                color: COLORS.secondary,
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={profile.email}
              onChangeText={(text) => setProfile({ ...profile, email: text })}
            />
          </View>

          <View>
            <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
              Phone Number
            </Text>
            <TextInput
              className="rounded-xl border p-3"
              style={{
                backgroundColor: COLORS.white,
                borderColor: COLORS.gray[200],
                color: COLORS.secondary,
              }}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              value={profile.phone}
              onChangeText={(text) => setProfile({ ...profile, phone: text })}
            />
          </View>

          <View>
            <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
              Address
            </Text>
            <TextInput
              className="rounded-xl border p-3"
              style={{
                backgroundColor: COLORS.white,
                borderColor: COLORS.gray[200],
                color: COLORS.secondary,
                height: 100,
              }}
              placeholder="Enter your address"
              multiline={true}
              textAlignVertical="top"
              value={profile.address}
              onChangeText={(text) => setProfile({ ...profile, address: text })}
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="p-6">
        <Pressable
          onPress={handleSave}
          className="rounded-2xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Save Changes</Text>
        </Pressable>
      </View>

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        message="Profile updated successfully!"
      />
    </View>
  );
}
