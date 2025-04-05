import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { UserProfile } from '../../types/user';
import { useProfileOperations } from '../../hooks/useProfileOperations';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { createFormData } from '../../services/profileService';

export default function EditProfile() {
  const router = useRouter();
  const { showToast } = useToast();
  const { updateProfile, getProfile, isLoading } = useProfileOperations(); // Add getProfile
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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const profileData = await getProfile(); // profileData might be undefined
        if (profileData) { // Check if profileData is not undefined
          setFormData({
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            address: profileData.address || '',
            profile_image: profileData.profile_image || '',
          });
        } else {
          showToast('Failed to load profile data', 'error');
        }
      } catch (error) {
        showToast('Failed to load profile data', 'error');
      }
    };
    loadUser();
  }, []); // Ensure this runs on component mount

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
      showToast('Please grant camera roll permissions to change profile picture.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets?.[0]) {
      setFormData((prev) => ({
        ...prev,
        profile_image: result.assets[0].uri || '',
        tempImageUri: result.assets[0].uri || '',
        imageFile: result.assets[0] as any,
      }));
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      showToast('Please correct the errors in the form', 'error');
      return;
    }

    try {
      const { tempImageUri, ...profileData } = formData;
      const formDataToSend = createFormData(tempImageUri || '', {
        ...profileData,
        address: profileData.address?.trim() || '',
      });

      await updateProfile(formDataToSend);
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      if (error.data?.errors) {
        setErrors(error.data.errors);
      }
      showToast(error.message || 'Failed to update profile', 'error');
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
          disabled={isLoading}
          className="mt-6 rounded-xl p-4"
          style={{
            backgroundColor: isLoading ? COLORS.gray[400] : COLORS.primary,
            opacity: isLoading ? 0.7 : 1,
          }}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-lg font-semibold text-white">Update Profile</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
