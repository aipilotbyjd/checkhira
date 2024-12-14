import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { Octicons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Payment {
  id: number;
  description: string;
  amount: string;
}

export default function EditPayment() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [payment, setPayment] = useState<Payment>({
    id: Number(id),
    description: '',
    amount: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call
    setPayment({
      id: Number(id),
      description: 'Sample Payment',
      amount: '1000',
    });
  }, [id]);

  const handleUpdate = () => {
    if (!payment.description || !payment.amount) {
      Alert.alert('Invalid Entry', 'Please fill in all fields');
      return;
    }

    // TODO: Implement API call
    console.log('Updating payment:', { ...payment, date: selectedDate });
    Alert.alert('Success', 'Payment updated successfully!');
    router.back();
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1">
        <View className="px-6 pt-6">
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center rounded-2xl p-4"
            style={{ backgroundColor: COLORS.gray[100] }}>
            <Octicons name="calendar" size={24} color={COLORS.primary} />
            <Text className="ml-3 flex-1 text-base" style={{ color: COLORS.gray[600] }}>
              {format(selectedDate, 'MMMM dd, yyyy')}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.gray[400]} />
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              mode="date"
              display="spinner"
              value={selectedDate}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
            />
          )}

          <View className="mt-6 space-y-4">
            <View>
              <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
                Description
              </Text>
              <TextInput
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.gray[200],
                  color: COLORS.secondary,
                }}
                value={payment.description}
                onChangeText={(text) => setPayment({ ...payment, description: text })}
              />
            </View>

            <View>
              <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
                Amount
              </Text>
              <TextInput
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.gray[200],
                  color: COLORS.secondary,
                }}
                value={payment.amount}
                keyboardType="numeric"
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9.]/g, '');
                  setPayment({ ...payment, amount: numericText });
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="space-y-3 p-6">
        <Pressable
          onPress={handleUpdate}
          className="mb-4 rounded-2xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Update Payment</Text>
        </Pressable>

        <Pressable
          onPress={handleDelete}
          className="rounded-2xl p-4"
          style={{ backgroundColor: COLORS.error + '15' }}>
          <Text className="text-center text-lg font-semibold" style={{ color: COLORS.error }}>
            Delete Payment
          </Text>
        </Pressable>
      </View>

      <Modal transparent visible={showDeleteModal} animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="mx-4 w-[90%] rounded-2xl bg-white p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
                Confirm Delete
              </Text>
              <Pressable onPress={() => setShowDeleteModal(false)}>
                <Octicons name="x" size={20} color={COLORS.gray[400]} />
              </Pressable>
            </View>

            <Text className="mb-6" style={{ color: COLORS.gray[600] }}>
              Are you sure you want to delete this payment?
            </Text>

            <View className="flex-row space-x-3">
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                className="mx-1 flex-1 rounded-xl border p-3"
                style={{ borderColor: COLORS.gray[200] }}>
                <Text className="text-center font-semibold" style={{ color: COLORS.gray[600] }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  // TODO: Implement API call
                  console.log('Deleting payment:', id);
                  setShowDeleteModal(false);
                  setShowSuccessModal(true);
                }}
                className="mx-1 flex-1 rounded-xl p-3"
                style={{ backgroundColor: COLORS.error }}>
                <Text className="text-center font-semibold text-white">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="mx-4 w-[90%] rounded-2xl bg-white p-6">
            <View className="mb-4 items-center">
              <MaterialCommunityIcons name="check-circle" size={50} color={COLORS.success} />
            </View>

            <Text
              className="mb-3 text-center text-xl font-semibold"
              style={{ color: COLORS.secondary }}>
              Success!
            </Text>

            <Text className="mb-6 text-center" style={{ color: COLORS.gray[600] }}>
              Payment deleted successfully
            </Text>

            <Pressable
              onPress={() => {
                setShowSuccessModal(false);
                router.back();
              }}
              className="rounded-xl p-3"
              style={{ backgroundColor: COLORS.success }}>
              <Text className="text-center font-semibold text-white">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
