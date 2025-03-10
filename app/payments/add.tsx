import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, TextInput, Alert } from 'react-native';
import { Octicons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppSettings } from '../../contexts/SettingsContext';
import { PaymentFormSkeleton } from '../../components/PaymentFormSkeleton';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDateForAPI } from '../../utils/dateFormatter';
import { Payment, PaymentSource } from '../../types/payment';
import { useApi } from '../../hooks/useApi';
import { api } from '../../services/axiosClient';

export default function AddPayment() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const [payment, setPayment] = useState<Payment>({
    id: Date.now(),
    amount: '',
    from: '',
    category: '',
    description: '',
    source_id: 1,
    user_id: user?.id,
    date: formatDateForAPI(new Date())
  });

  const { execute, isLoading: isApiLoading } = useApi({
    showSuccessToast: true,
    successMessage: 'Payment added successfully!',
    showErrorToast: true,
    defaultErrorMessage: 'Failed to add payment. Please try again.'
  });

  const { execute: executeGetSources, isLoading: isSourcesLoading } = useApi({
    showErrorToast: true,
    defaultErrorMessage: 'Failed to load payment sources. Please try again.'
  });

  const { settings } = useAppSettings();
  const { showToast } = useToast();

  useEffect(() => {
    loadPaymentSources();
  }, [settings]);

  const validateForm = () => {
    if (!payment.from || !payment.description || !payment.amount) {
      showToast('Please fill in all required fields', 'error');
      return false;
    }

    const numericAmount = parseFloat(payment.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showToast('Please enter a valid positive number', 'error');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || isSaving) return;

    try {
      setIsSaving(true);
      const paymentData = {
        date: formatDateForAPI(selectedDate),
        amount: parseFloat(payment.amount),
        from: payment.from.trim(),
        description: payment.description.trim(),
        source_id: payment.source_id,
        user_id: user?.id,
      };

      const result = await execute(() => api.post('/payments', paymentData));
      if (result) {
        router.back();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const loadPaymentSources = async () => {
    try {
      if (settings?.payment_sources && settings.payment_sources.length > 0) {
        setPaymentSources(settings.payment_sources);
      } else {
        const response = await executeGetSources(() => api.get('/payments/sources'));
        if (response?.data) {
          setPaymentSources(response.data);
        }
      }
    } catch (error) {
      // Error handled by useApi
    }
  };

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

  if (isSourcesLoading) {
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
            <MaterialCommunityIcons name="calendar" size={24} color={COLORS.primary} />
            <Text className="ml-3 flex-1 text-base" style={{ color: COLORS.gray[600] }}>
              {format(selectedDate, 'MMMM dd, yyyy')}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.gray[400]} />
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
                    setPayment({ ...payment, amount: formattedText });
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
          disabled={isSaving || isApiLoading}
          className="rounded-2xl p-4"
          style={{
            backgroundColor: isSaving || isApiLoading ? COLORS.gray[300] : COLORS.primary,
          }}>
          <Text className="text-center text-lg font-semibold text-white">
            {isSaving || isApiLoading ? 'Saving...' : 'Save Payment'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
