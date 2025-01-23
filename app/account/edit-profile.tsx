import { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { SuccessModal } from '../../components/SuccessModal';
import { useProfileOperations } from '../../hooks/useProfileOperations';
import { UserProfile } from '../../services/profileService';

export default function EditProfile() {
  const router = useRouter();
  const { isLoading, getProfile, updateProfile, pickImage, uploadProfileImage } =
    useProfileOperations();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    require('../../assets/profile_image.jpg')
  );
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    profile_image: require('../../assets/profile_image.jpg'),
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await getProfile();
    console.log('Profile data:', data);
    if (data) {
      const firstName = data.first_name || '';
      const lastName = data.last_name || '';
      setProfile({
        ...data,
        firstName,
        lastName,
        profile_image: data.profile_image || require('../../assets/profile_image.jpg'),
      });
    }
  };

  const handleImagePick = async () => {
    const imageUri = await pickImage();
    if (imageUri) {
      // Validate file extension
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
      const filename = imageUri.split('/').pop() || '';
      const extension = filename.split('.').pop()?.toLowerCase() || '';

      if (!validExtensions.includes(extension)) {
        Alert.alert('Invalid File Type', 'Please select an image file (JPG, PNG, GIF, or SVG)');
        return;
      }

      setSelectedImage(imageUri);
      setProfile({ ...profile, tempImageUri: imageUri });
    }
  };

  const handleSave = async () => {
    if (!profile.firstName || !profile.lastName || !profile.email) {
      Alert.alert('Invalid Entry', 'Please fill in all required fields');
      return;
    }

    try {
      // Prepare profile data excluding tempImageUri
      const { tempImageUri, ...profileToUpdate } = profile;

      // Optimistically update the UI
      const previousProfile = { ...profile };
      setProfile({ ...profileToUpdate, profile_image: selectedImage || profile.profile_image });

      // First upload image if selected
      let updatedImageUrl = profile.profile_image;
      if (selectedImage) {
        const imageResult = await uploadProfileImage(selectedImage);
        if (imageResult?.data?.profile_image) {
          updatedImageUrl = imageResult.data.profile_image;
          setProfile({ ...profileToUpdate, profile_image: updatedImageUrl });
        }
      }

      // Then update profile
      const result = await updateProfile({
        ...profileToUpdate,
        profile_image: updatedImageUrl,
      });

      if (result) {
        setShowSuccessModal(true);
      } else {
        // Revert to previous state if update fails
        setProfile(previousProfile);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  // Updated the displayImage logic
  const displayImage =
    profile.tempImageUri
      ? { uri: profile.tempImageUri }
      : typeof profile.profile_image === 'string'
      ? { uri: profile.profile_image }
      : profile.profile_image
      ? profile.profile_image
      : require('../../assets/profile_image.jpg');

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1">
        {/* Profile Image Section */}
        <View className="items-center px-6 pt-6">
          <View className="relative">
            <View className="h-24 w-24 rounded-full bg-gray-200">
              <Image 
                source={displayImage} 
                className="rounded-full"
                style={{ width: 96, height: 96 }}
              />
            </View>
            <Pressable
              onPress={handleImagePick}
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
              First Name <Text style={{ color: COLORS.error }}>*</Text>
            </Text>
            <TextInput
              className="rounded-xl border p-3"
              style={{
                backgroundColor: COLORS.white,
                borderColor: COLORS.gray[200],
                color: COLORS.secondary,
              }}
              placeholder="Enter your first name"
              value={profile.firstName}
              onChangeText={(text) => setProfile({ ...profile, firstName: text })}
            />
          </View>

          <View>
            <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
              Last Name <Text style={{ color: COLORS.error }}>*</Text>
            </Text>
            <TextInput
              className="rounded-xl border p-3"
              style={{
                backgroundColor: COLORS.white,
                borderColor: COLORS.gray[200],
                color: COLORS.secondary,
              }}
              placeholder="Enter your last name"
              value={profile.lastName}
              onChangeText={(text) => setProfile({ ...profile, lastName: text })}
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
