import React, { useState } from 'react';
import { Text, View, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { Octicons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Payment {
  id: number;
  description: string;
  amount: string;
}

export default function AddPayment() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [payments, setPayments] = useState<Payment[]>([
    { id: 1, description: '', amount: '' }
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const calculateTotal = () => {
    return payments.reduce((sum, payment) => {
      const amount = Number(payment.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const addPayment = () => {
    if (payments.length >= 10) {
      Alert.alert('Maximum Limit', 'You can add up to 10 payments only.');
      return;
    }
    setPayments([...payments, { id: Date.now(), description: '', amount: '' }]);
  };

  const removePayment = (paymentId: number) => {
    if (payments.length === 1) {
      Alert.alert('Cannot Remove', 'At least one payment is required.');
      return;
    }
    setPayments(payments.filter((p) => p.id !== paymentId));
  };

  const updatePayment = (id: number, field: keyof Payment, value: string) => {
    setPayments(
      payments.map((payment) =>
        payment.id === id ? { ...payment, [field]: value } : payment
      )
    );
  };

  const validatePayments = () => {
    const invalidPayments = payments.filter(
      (payment) => !payment.description || !payment.amount
    );
    if (invalidPayments.length > 0) {
      Alert.alert(
        'Invalid Entries',
        'Please fill in both description and amount for all payments.'
      );
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validatePayments()) return;
    
    // TODO: Implement API call to save payments
    const paymentData = {
      date: selectedDate,
      payments: payments,
      totalAmount: calculateTotal()
    };
    
    console.log('Saving payments:', paymentData);
    Alert.alert('Success', 'Payments saved successfully!');
    router.back();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
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
      </View>

      {/* Payments List */}
      <ScrollView className="mt-6 flex-1 px-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
            Payments
          </Text>
          <Pressable
            onPress={addPayment}
            className="rounded-lg p-2"
            style={{ backgroundColor: COLORS.primary + '15' }}>
            <Octicons name="plus" size={24} color={COLORS.primary} />
          </Pressable>
        </View>

        {payments.map((payment) => (
          <View
            key={payment.id}
            className="mb-4 rounded-2xl p-4"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <View className="flex-row items-center justify-between mb-3">
              <TextInput
                className="flex-1 rounded-xl border p-3 mr-2"
                style={{
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.gray[200],
                  color: COLORS.secondary,
                }}
                value={payment.description}
                placeholder="Description"
                onChangeText={(text) => updatePayment(payment.id, 'description', text)}
              />
              <TextInput
                className="w-32 rounded-xl border p-3"
                style={{
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.gray[200],
                  color: COLORS.secondary,
                }}
                value={payment.amount}
                placeholder="0.00"
                keyboardType="numeric"
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9.]/g, '');
                  updatePayment(payment.id, 'amount', numericText);
                }}
              />
            </View>
            {payments.length > 1 && (
              <Pressable
                onPress={() => removePayment(payment.id)}
                className="self-end rounded-lg p-2"
                style={{ backgroundColor: COLORS.error + '15' }}>
                <Octicons name="trash" size={20} color={COLORS.error} />
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Total Amount Footer */}
      <View className="px-6 pb-6">
        <View className="mb-4 rounded-2xl p-4" style={{ backgroundColor: COLORS.primary + '10' }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="cash-multiple" size={24} color={COLORS.primary} />
              <Text className="ml-3 text-lg font-semibold" style={{ color: COLORS.secondary }}>
                Total Amount
              </Text>
            </View>
            <Text className="text-xl font-bold" style={{ color: COLORS.primary }}>
              ₹ {calculateTotal().toFixed(2)}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleSave}
          className="rounded-2xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Save Payments</Text>
        </Pressable>
      </View>
    </View>
  );
}
