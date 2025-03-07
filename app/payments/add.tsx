import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { Octicons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SuccessModal } from '../../components/SuccessModal';
import { usePaymentOperations } from '../../hooks/usePaymentOperations';
import { useAppSettings } from '../../contexts/SettingsContext';
import { PaymentFormSkeleton } from '../../components/PaymentFormSkeleton';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
interface Payment {
  id: number;
  amount: number;
  from?: string;
  category?: string;
  description?: string;
  source_id: number;
  user_id?: number;
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
  const { user } = useAuth();

  const [payment, setPayment] = useState<Payment>({
    id: Date.now(),
    amount: '' as any,
    from: '',
    category: '',
    description: '',
    source_id: 1,
    user_id: user?.id,
  });

  const { createPayment, getPaymentSources, isLoading } = usePaymentOperations();
  const { settings } = useAppSettings();
  const { showToast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingSources(true);
      if (settings?.payment_sources) {
        setPaymentSources(settings.payment_sources);
      } else {
        const sources = await getPaymentSources();
        if (sources) {
          setPaymentSources(sources);
        }
      }
      setIsLoadingSources(false);
    };

    loadData();
  }, [settings]);

  const renderPaymentSourcesSkeleton = () => (
    <View className="flex-row flex-wrap gap-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View
          key={i}
          className="flex-row items-center rounded-full px-4 py-2"
          style={{
            backgroundColor: COLORS.gray[100],
            width: 100,
            height: 40,
          }}
        />
      ))}
    </View>
  );

  const handleSave = async () => {
    if (!payment.from || !payment.description || !payment.amount) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const numericAmount = payment.amount;
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showToast('Please enter a valid positive number', 'error');
      return;
    }

    const paymentData = {
      date: selectedDate,
      amount: numericAmount,
      from: payment.from?.trim(),
      category: payment.category || undefined,
      description: payment.description.trim(),
      source_id: payment.source_id,
    };

    try {
      const result = await createPayment(paymentData);
      if (result) {
        showToast('Payment added successfully');
        router.replace('/(tabs)/payments');
      }
    } catch (error) {
      showToast('Failed to save payment', 'error');
    }
  };

  if (isLoading) {
    return <PaymentFormSkeleton />;
  }

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
              <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
                From <Text style={{ color: COLORS.error }}>*</Text>
              </Text>
              <TextInput
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.gray[200],
                  color: COLORS.secondary,
                }}
                placeholder="e.g., John Doe, Company Inc"
                placeholderTextColor={COLORS.gray[300]}
                value={payment.from}
                onChangeText={(text) => setPayment({ ...payment, from: text })}
              />
            </View>

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
                      onPress={() => setPayment({ ...payment, source_id: source.id })}
                      className={`flex-row items-center rounded-full px-4 py-2 ${payment.source_id === source.id ? 'bg-primary' : 'bg-white'
                        }`}
                      style={{
                        borderWidth: 1,
                        borderColor:
                          payment.source_id === source.id ? COLORS.primary : COLORS.gray[200],
                      }}>
                      <MaterialCommunityIcons
                        name={source.icon as any}
                        size={20}
                        color={payment.source_id === source.id ? COLORS.black : COLORS.secondary}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={{
                          color: payment.source_id === source.id ? COLORS.black : COLORS.secondary,
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
                  value={payment.amount.toString()}
                  keyboardType="decimal-pad"
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    const parts = numericText.split('.');
                    const formattedText =
                      parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericText;
                    setPayment({ ...payment, amount: Number(formattedText) });
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
                value={payment.description}
                onChangeText={(text) => setPayment({ ...payment, description: text })}
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
    </View>
  );
}
