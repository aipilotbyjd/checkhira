import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { UserProfile } from '../../types/user';
import { useProfileOperations } from '../../hooks/useProfileOperations';
import { useToast } from '../../contexts/ToastContext';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';

export default function EditProfile() {
  const router = useRouter();
  const { showToast } = useToast();
  const { updateProfile, isLoading, getProfile } = useProfileOperations();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    profile_image: '',
  });
  const { user } = useAuth();

  const { isLoading: apiLoading, error, execute } = useApi({
    showSuccessToast: true,
    successMessage: 'Profile updated successfully!',
    defaultErrorMessage: 'Failed to update profile'
  });

  useEffect(() => {
    const loadUser = async () => {
      if (user) {
        setFormData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          profile_image: user.profile_image || '',
        });
      }
    };
    loadUser();
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^([0-9\s\-\+\(\)]*)$/.test(formData.phone) || formData.phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (formData.address && formData.address.length > 500) {
      newErrors.address = 'Address cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      //show toast
      showToast('Please grant camera roll permissions to change profile picture.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    //set form data
    setFormData((prev) => ({
      ...prev,
      profile_image: result?.assets?.[0]?.uri || '',
      tempImageUri: result?.assets?.[0]?.uri || '',
      imageFile: result?.assets?.[0] as any,
    }));
  };

  const refreshUser = async () => {
    try {
      const result = await execute(() => profileService.getProfile());
      if (result?.data) {
        // Update user context with new data
        await updateProfile(result.data);
      }
    } catch (error) {
      showToast('Failed to refresh user data', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      showToast('Please correct the errors in the form', 'error');
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Add all text fields
      formDataToSend.append('first_name', formData.first_name.trim());
      formDataToSend.append('last_name', formData.last_name.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('phone', formData.phone.trim());
      formDataToSend.append('address', formData.address?.trim() || '');

      // Add image if there's a new one
      if (formData.imageFile) {
        formDataToSend.append('profile_image', formData.imageFile as any);
      }

      // Option 1: Use the hook's updateProfile directly with FormData
      await updateProfile(formDataToSend);

      // Let the hook handle navigation and context updates
      // (Remove router.back() here)
    } catch (error: any) {
      if (error.status === 422) {
        const serverErrors = error.data?.errors || {};
        setErrors(serverErrors);
        showToast('Please correct the errors in the form', 'error');
      } else {
        showToast('Failed to update profile: ' + (error.message || 'Unknown error'), 'error');
      }
    }
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <View className="p-6">
        {/* Profile Image Section */}
        <View className="mb-6 items-center">
          <Pressable onPress={pickImage} className="relative">
            <View className="h-24 w-24 rounded-full bg-gray-200">
              <Image
                source={
                  formData.tempImageUri || formData.profile_image
                    ? { uri: formData.tempImageUri || formData.profile_image }
                    : require('../../assets/profile_image.jpg')
                }
                className="h-24 w-24 rounded-full"
                style={{ width: '100%', height: '100%' }}
              />
            </View>
            <View
              className="absolute bottom-0 right-0 rounded-full p-2"
              style={{ backgroundColor: COLORS.primary }}>
              <MaterialCommunityIcons name="camera" size={20} color="white" />
            </View>
          </Pressable>
        </View>

        {/* Form Fields */}
        <View className="space-y-4">
          {/* First Name */}
          <View>
            <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
              First Name <Text style={{ color: COLORS.error }}>*</Text>
            </Text>
            <TextInput
              className={`rounded-xl border p-3 ${errors.first_name ? 'border-error' : 'border-gray-200'}`}
              style={{
                backgroundColor: COLORS.white,
                borderColor: errors.first_name ? COLORS.error : COLORS.gray[200],
                color: COLORS.secondary,
              }}
              value={formData.first_name}
              onChangeText={(text) => {
                setFormData({ ...formData, first_name: text });
                if (errors.first_name) {
                  setErrors({ ...errors, first_name: '' });
                }
              }}
              placeholder="Enter first name"
            />
            {errors.first_name && (
              <Text className="mt-1 text-xs" style={{ color: COLORS.error }}>
                {errors.first_name}
              </Text>
            )}
          </View>

          {/* Last Name */}
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
              value={formData.last_name}
              onChangeText={(text) => setFormData({ ...formData, last_name: text })}
              placeholder="Enter last name"
            />
          </View>

          {/* Email */}
          <View>
            <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
              Email <Text style={{ color: COLORS.error }}>*</Text>
            </Text>
            <TextInput
              className="rounded-xl border p-3"
              style={{
                backgroundColor: COLORS.white,
                borderColor: COLORS.gray[200],
                color: COLORS.secondary,
              }}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Phone */}
          <View>
            <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
              Phone
            </Text>
            <TextInput
              className="rounded-xl border p-3"
              style={{
                backgroundColor: COLORS.white,
                borderColor: COLORS.gray[200],
                color: COLORS.secondary,
              }}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          {/* Address */}
          <View>
            <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
              Address
            </Text>
            <TextInput
              className={`rounded-xl border p-3 ${errors.address ? 'border-error' : 'border-gray-200'}`}
              style={{
                backgroundColor: COLORS.white,
                borderColor: errors.address ? COLORS.error : COLORS.gray[200],
                color: COLORS.secondary,
              }}
              value={formData.address || ''}
              onChangeText={(text) => {
                setFormData({ ...formData, address: text });
                if (errors.address) {
                  setErrors({ ...errors, address: '' });
                }
              }}
              placeholder="Enter address"
              multiline
              numberOfLines={3}
            />
            {errors.address && (
              <Text className="mt-1 text-xs" style={{ color: COLORS.error }}>
                {errors.address}
              </Text>
            )}
          </View>
        </View>

        {/* Update Button */}
        <Pressable
          onPress={handleUpdate}
          disabled={apiLoading}
          className="mt-6 rounded-xl p-4"
          style={{
            backgroundColor: apiLoading ? COLORS.gray[400] : COLORS.primary,
            opacity: apiLoading ? 0.7 : 1,
          }}>
          {apiLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-lg font-semibold text-white">Update Profile</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
