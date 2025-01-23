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
  const { isLoading, getProfile, updateProfile, pickImage } = useProfileOperations();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    profile_image: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await getProfile();
    if (data) {
      setProfile({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        profile_image: data.profile_image || '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profile.firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!profile.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    if (!profile.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!profile.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^([0-9\s\-\+\(\)]*)$/.test(profile.phone) || profile.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePick = async () => {
    const imageUri = await pickImage();
    if (imageUri) {
      setSelectedImage(imageUri);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('first_name', profile.firstName);
      formData.append('last_name', profile.lastName);
      formData.append('email', profile.email);
      formData.append('phone', profile.phone);
      formData.append('address', profile.address || '');

      if (selectedImage) {
        const filename = selectedImage.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('profile_image', {
          uri: selectedImage,
          name: filename,
          type,
        } as any);
      }

      const result = await updateProfile(formData);
      if (result) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const displayImage = selectedImage
    ? { uri: selectedImage }
    : profile.profile_image
    ? { uri: profile.profile_image }
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
                className="h-24 w-24 rounded-full"
                resizeMode="cover"
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
          {/* First Name */}
          <View>
            <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
              First Name <Text style={{ color: COLORS.error }}>*</Text>
            </Text>
            <TextInput
              className="rounded-xl border p-3"
              style={{
                backgroundColor: COLORS.white,
                borderColor: errors.firstName ? COLORS.error : COLORS.gray[200],
                color: COLORS.secondary,
              }}
              placeholder="Enter your first name"
              value={profile.firstName}
              onChangeText={(text) => {
                setProfile({ ...profile, firstName: text });
                if (errors.firstName) {
                  setErrors({ ...errors, firstName: '' });
                }
              }}
            />
            {errors.firstName && (
              <Text className="mt-1 text-sm" style={{ color: COLORS.error }}>
                {errors.firstName}
              </Text>
            )}
          </View>

          {/* Similar blocks for lastName, email, phone, and address with validation messages */}
          {/* ... */}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="p-6">
        <Pressable
          onPress={handleSave}
          className="rounded-2xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">
            Save Changes
          </Text>
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
