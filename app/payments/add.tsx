import React, { useState } from 'react';
import { Text, View, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { Octicons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DeleteConfirmationModal } from '../../components/DeleteConfirmationModal';
import { SuccessModal } from '../../components/SuccessModal';
import { PAYMENT_SOURCES, PaymentSource } from '../../constants/payments';
// import { useDataOperations } from '../../hooks/useDataOperations';

interface Payment {
  id: number;
  description: string;
  amount: string;
  category?: string;
  notes?: string;
  source: PaymentSource;
}

export default function AddPayment() {
  const router = useRouter();
  const { apiCall, state } = useDataOperations();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [payment, setPayment] = useState<Payment>({
    id: Date.now(),
    description: '',
    amount: '',
    category: '',
    notes: '',
    source: 'cash',
  });

  const handleSave = async () => {
    if (!payment.description || !payment.amount) {
      Alert.alert('Invalid Entry', 'Please fill in all fields');
      return;
    }

    const paymentData = {
      date: selectedDate,
      ...payment,
    };

    try {
      console.log('Saving payment:', paymentData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving payment:', error);
      Alert.alert('Error', 'Failed to save payment. Please try again.');
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1">
        {/* Date Picker Section */}
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
              <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
                Payment Source <Text style={{ color: COLORS.error }}>*</Text>
              </Text>
              <View className="relative">
                <Pressable
                  onPress={() => {
                    Alert.alert(
                      'Select Payment Source',
                      '',
                      PAYMENT_SOURCES.map((source) => ({
                        text: source.label,
                        onPress: () => setPayment({ ...payment, source: source.value }),
                      })).concat([
                        {
                          text: 'Cancel',
                          style: 'cancel',
                        },
                      ])
                    );
                  }}
                  className="flex-row items-center justify-between rounded-xl border p-3"
                  style={{
                    backgroundColor: COLORS.white,
                    borderColor: COLORS.gray[200],
                  }}>
                  <Text style={{ color: COLORS.secondary }}>
                    {PAYMENT_SOURCES.find((s) => s.value === payment.source)?.label ||
                      'Select Source'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.gray[400]} />
                </Pressable>
              </View>
            </View>

            <View>
              <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
                Amount <Text style={{ color: COLORS.error }}>*</Text>
              </Text>
              <View className="relative">
                <Text
                  className="absolute left-3 top-3 text-base"
                  style={{ color: COLORS.gray[400] }}>
                  $
                </Text>
                <TextInput
                  className="rounded-xl border p-3 pl-7"
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
              <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
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
          onPress={handleSave}
          className="rounded-2xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Save Payment</Text>
        </Pressable>
      </View>

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        message="Payment added successfully"
      />
    </View>
  );
}
