import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAnalytics } from '../../hooks/useAnalytics'; // Import the hook
import { analyticsService } from '../../utils/analytics'; // Import the service for events

export default function UpdateProfile() {
  useAnalytics('UpdateProfileScreen'); // Add screen view tracking
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    profileImage: '',
    tempImageUri: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleImagePick = () => {
    // Image picking functionality removed
    Alert.alert('Feature Unavailable', 'Profile image upload is not available in this version.');
  };

  const handleUpdate = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Error', 'Please enter your first and last names.');
      return;
    }
    setIsLoading(true);
    try {
      // Simulate API update – replace with actual API call
      // const updateResponse = await userService.updateProfile(formData); // Example API call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Keep simulation for now

      // Log successful profile update
      await analyticsService.logEvent('profile_update_success');

      setIsLoading(false);
      router.push('/(tabs)');
    } catch (error: any) {
      setIsLoading(false);
      // Log failed profile update
      await analyticsService.logEvent('profile_update_failed', { error: error?.message });
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="p-6">
        <View className="mb-8 items-center">
          <Pressable onPress={handleImagePick} className="relative">
            <View className="h-24 w-24 rounded-full bg-gray-200">
              {formData.tempImageUri || formData.profileImage ? (
                <Image
                  source={{ uri: formData.tempImageUri || formData.profileImage }}
                  className="h-24 w-24 rounded-full"
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <MaterialCommunityIcons
                  name="account"
                  size={50}
                  color={COLORS.gray[400]}
                  style={{ alignSelf: 'center', marginTop: 35 }}
                />
              )}
            </View>
            <View
              className="absolute bottom-0 right-0 rounded-full p-2"
              style={{ backgroundColor: COLORS.primary }}>
              <MaterialCommunityIcons name="camera" size={20} color="white" />
            </View>
          </Pressable>
        </View>
        <View className="mb-4">
          <Text className="mb-2 text-base" style={{ color: COLORS.gray[600] }}>
            First Name
          </Text>
          <TextInput
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            placeholder="Enter your first name"
            placeholderTextColor={COLORS.gray[400]}
            className="rounded-xl border p-4"
            style={{
              backgroundColor: COLORS.white,
              borderColor: COLORS.gray[200],
              color: COLORS.secondary,
            }}
          />
        </View>
        <View className="mb-6">
          <Text className="mb-2 text-base" style={{ color: COLORS.gray[600] }}>
            Last Name
          </Text>
          <TextInput
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            placeholder="Enter your last name"
            placeholderTextColor={COLORS.gray[400]}
            className="rounded-xl border p-4"
            style={{
              backgroundColor: COLORS.white,
              borderColor: COLORS.gray[200],
              color: COLORS.secondary,
            }}
          />
        </View>
        <Pressable
          onPress={handleUpdate}
          className="mb-4 rounded-xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-lg font-semibold text-white">Update Profile</Text>
          )}
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)')}>
          <Text className="text-center text-base" style={{ color: COLORS.primary }}>
            Skip
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}
