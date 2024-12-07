import { Text, View, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { MaterialCommunityIcons, Ionicons, Octicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../constants/theme';

export default function Payments() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [payments, setPayments] = useState([{ id: 1, description: '', amount: '' }]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const calculateTotal = () => {
    return payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
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

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      {/* Header */}
      <View className="px-6 pt-6">
        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center rounded-2xl p-4"
          style={{ backgroundColor: COLORS.gray[100] }}>
          <MaterialCommunityIcons name="calendar-month" size={24} color={COLORS.primary} />
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

      {/* Scrollable Content */}
      <ScrollView className="mt-6 flex-1 px-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
            Payments
          </Text>
          <Pressable
            onPress={addPayment}
            className="rounded-lg p-2"
            style={{ backgroundColor: COLORS.primary + '15' }}>
            <Octicons name="plus" size={20} color={COLORS.primary} />
          </Pressable>
        </View>

        {/* Payment Cards */}
        {payments.map((payment, index) => (
          <View
            key={payment.id}
            className="mb-4 rounded-2xl p-4"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-sm" style={{ color: COLORS.gray[400] }}>
                Payment {index + 1}
              </Text>
              {index !== 0 && (
                <Pressable
                  onPress={() => removePayment(payment.id)}
                  className="rounded-lg p-2"
                  style={{ backgroundColor: COLORS.error + '15' }}>
                  <Octicons name="trash" size={16} color={COLORS.error} />
                </Pressable>
              )}
            </View>

            <View className="space-y-3">
              <View>
                <Text className="mb-1 text-sm" style={{ color: COLORS.gray[400] }}>
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
                  placeholder="Enter payment description"
                  onChangeText={(text) => {
                    setPayments(
                      payments.map((p) => (p.id === payment.id ? { ...p, description: text } : p))
                    );
                  }}
                />
              </View>
              <View>
                <Text className="mb-1 text-sm" style={{ color: COLORS.gray[400] }}>
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
                  placeholder="0.00"
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    setPayments(
                      payments.map((p) => (p.id === payment.id ? { ...p, amount: numericText } : p))
                    );
                  }}
                />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
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
          onPress={() => Alert.alert('Success', 'Payments saved successfully!')}
          className="rounded-2xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Save Payments</Text>
        </Pressable>
      </View>
    </View>
  );
}
