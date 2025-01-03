import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { Octicons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DeleteConfirmationModal } from '../../../components/DeleteConfirmationModal';
import { SuccessModal } from '../../../components/SuccessModal';
import { PAYMENT_SOURCES, PaymentSource } from '../../../constants/payments';

interface Payment {
  id: number;
  description: string;
  amount: string;
  category?: string;
  notes?: string;
  source: PaymentSource;
}

export default function EditPayment() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [payment, setPayment] = useState<Payment>({
    id: Number(id),
    description: 'Sample Payment',
    amount: '5000',
    category: '',
    notes: '',
    source: 'cash',
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
      category: 'Housing',
      notes: 'Monthly rent payment',
      source: 'cash',
    });
  }, [id]);

  const handleUpdate = () => {
    if (!payment.description || !payment.amount) {
      Alert.alert('Invalid Entry', 'Please fill in all fields');
      return;
    }

    // TODO: Implement API call
    console.log('Updating payment:', { ...payment, date: selectedDate });
    setShowSuccessModal(true);
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
                Description <Text style={{ color: COLORS.error }}>*</Text>
              </Text>
              <TextInput
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.gray[200],
                  color: COLORS.secondary,
                }}
                placeholder="e.g., Monthly Rent, Electricity Bill"
                placeholderTextColor={COLORS.gray[300]}
                value={payment.description}
                onChangeText={(text) => setPayment({ ...payment, description: text })}
              />
            </View>

            <View>
              <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
                Category
              </Text>
              <TextInput
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.gray[200],
                  color: COLORS.secondary,
                }}
                placeholder="e.g., Housing, Utilities, Food"
                placeholderTextColor={COLORS.gray[300]}
                value={payment.category}
                onChangeText={(text) => setPayment({ ...payment, category: text })}
              />
            </View>

            <View>
              <Text className="mb-3 text-sm" style={{ color: COLORS.gray[400] }}>
                Payment Source <Text style={{ color: COLORS.error }}>*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {PAYMENT_SOURCES.map((source) => (
                  <Pressable
                    key={source.value}
                    onPress={() => setPayment({ ...payment, source: source.value })}
                    className={`flex-row items-center rounded-full px-4 py-2 ${
                      payment.source === source.value ? 'bg-primary' : 'bg-white'
                    }`}
                    style={{
                      borderWidth: 1,
                      borderColor:
                        payment.source === source.value ? COLORS.primary : COLORS.gray[200],
                    }}>
                    <Text
                      style={{
                        color: payment.source === source.value ? COLORS.black : COLORS.secondary,
                      }}>
                      {source.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text className="mb-2 mt-3 text-sm" style={{ color: COLORS.gray[400] }}>
                Amount <Text style={{ color: COLORS.error }}>*</Text>
              </Text>
              <View className="relative">
                <TextInput
                  className="rounded-xl border p-3"
                  style={{
                    backgroundColor: COLORS.white,
                    borderColor: COLORS.gray[200],
                    color: COLORS.secondary,
                  }}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.gray[300]}
                  value={payment.amount}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    setPayment({ ...payment, amount: numericText });
                  }}
                />
              </View>
              <Text className="mt-1 text-xs" style={{ color: COLORS.gray[400] }}>
                Enter amount in dollars
              </Text>
            </View>

            <View>
              <Text className="mb-2 mt-3 text-sm" style={{ color: COLORS.gray[400] }}>
                Notes
              </Text>
              <TextInput
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.gray[200],
                  color: COLORS.secondary,
                  height: 100,
                }}
                placeholder="Add any additional details about this payment"
                placeholderTextColor={COLORS.gray[300]}
                multiline={true}
                textAlignVertical="top"
                value={payment.notes}
                onChangeText={(text) => setPayment({ ...payment, notes: text })}
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

      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          console.log('Deleting payment:', id);
          setShowDeleteModal(false);
          setShowSuccessModal(true);
        }}
        message="Are you sure you want to delete this payment?"
      />

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        message={showDeleteModal ? 'Payment deleted successfully' : 'Payment updated successfully'}
      />
    </View>
  );
}
