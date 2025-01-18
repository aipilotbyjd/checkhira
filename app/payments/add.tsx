import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { Octicons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SuccessModal } from '../../components/SuccessModal';
import { usePaymentOperations } from '../../hooks/usePaymentOperations';

interface Payment {
  id: number;
  description: string;
  amount: string;
  category?: string;
  notes?: string;
  source: string;
}

interface PaymentSource {
  id: number;
  name: string;
  icon: string;
}

export default function AddPayment() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(true);

  const [payment, setPayment] = useState<Payment>({
    id: Date.now(),
    description: '',
    amount: '',
    category: '',
    notes: '',
    source: 'cash',
  });

  const { createPayment, getPaymentSources, isLoading } = usePaymentOperations();

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingSources(true);
      const sources = await getPaymentSources();
      if (sources) {
        setPaymentSources(sources);
      }
      setIsLoadingSources(false);
    };

    loadData();
  }, []);

  const renderPaymentSourcesSkeleton = () => (
    <View className="flex-row flex-wrap gap-2">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="flex-row items-center rounded-full px-4 py-2"
          style={{
            backgroundColor: COLORS.gray[100],
            width: 120,
            height: 40,
          }}
        />
      ))}
    </View>
  );

  const handleSave = async () => {
    if (!payment.description || !payment.amount) {
      Alert.alert('Invalid Entry', 'Please fill in all fields');
      return;
    }

    const paymentData = {
      date: selectedDate,
      description: payment.description.trim(),
      amount: payment.amount,
      category: payment.category,
      notes: payment.notes,
      source: payment.source,
    };

    const result = await createPayment(paymentData);
    if (result) {
      setShowSuccessModal(true);
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
            {/* <View>
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
            </View> */}

            {/* <View>
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
            </View> */}

            <View>
              <Text className="mb-3 text-sm" style={{ color: COLORS.gray[400] }}>
                Payment Source <Text style={{ color: COLORS.error }}>*</Text>
              </Text>
              {isLoadingSources ? (
                renderPaymentSourcesSkeleton()
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {paymentSources.map((source) => (
                    <Pressable
                      key={source.id}
                      onPress={() => setPayment({ ...payment, source: source.name.toLowerCase() })}
                      className={`flex-row items-center rounded-full px-4 py-2 ${
                        payment.source === source.name.toLowerCase() ? 'bg-primary' : 'bg-white'
                      }`}
                      style={{
                        borderWidth: 1,
                        borderColor:
                          payment.source === source.name.toLowerCase()
                            ? COLORS.primary
                            : COLORS.gray[200],
                      }}>
                      <MaterialCommunityIcons
                        name={source.icon as any}
                        size={20}
                        color={
                          payment.source === source.name.toLowerCase()
                            ? COLORS.black
                            : COLORS.secondary
                        }
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={{
                          color:
                            payment.source === source.name.toLowerCase()
                              ? COLORS.black
                              : COLORS.secondary,
                        }}>
                        {source.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
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
