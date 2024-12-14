import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { Octicons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
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

  useEffect(() => {
    // TODO: Fetch payment data from API
    // For now, using mock data
    setPayment({
      id: Number(id),
      description: 'Sample Payment',
      amount: '1000',
    });
  }, [id]);

  const updatePayment = (field: keyof Payment, value: string) => {
    setPayment((prev) => ({ ...prev, [field]: value }));
  };

  const validatePayment = () => {
    if (!payment.description || !payment.amount) {
      Alert.alert('Invalid Entry', 'Please fill in both description and amount.');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validatePayment()) return;

    // TODO: Implement API call to update payment
    console.log('Updating payment:', payment);
    Alert.alert('Success', 'Payment updated successfully!');
    router.back();
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
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

      <ScrollView className="mt-6 flex-1 px-6">
        <Text className="mb-4 text-lg font-semibold" style={{ color: COLORS.secondary }}>
          Edit Payment
        </Text>

        <View className="rounded-2xl p-4" style={{ backgroundColor: COLORS.background.secondary }}>
          <View className="mb-4">
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
              onChangeText={(text) => updatePayment('description', text)}
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
                updatePayment('amount', numericText);
              }}
            />
          </View>
        </View>
      </ScrollView>

      <View className="px-6 pb-6">
        <Pressable
          onPress={handleSave}
          className="rounded-2xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Update Payment</Text>
        </Pressable>
      </View>
    </View>
  );
}
