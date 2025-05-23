import React, { useState, useEffect, useCallback } from 'react';
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
import { useLanguage } from '../../contexts/LanguageContext';
import { useRewardedAd } from '../../components/ads/RewardedAdComponent';

const getLocalizedName = (source: PaymentSource, currentLocale: string): string => {
  const key = `name_${currentLocale}` as keyof PaymentSource;
  return (source[key] as string) || source.name;
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

export default function AddPayment() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { t, locale } = useLanguage();

  const [payment, setPayment] = useState<Payment>({
    id: Date.now(),
    amount: '',
    from: '',
    description: '',
    source_id: 1,
    user_id: user?.id,
    date: formatDateForAPI(new Date()),
    source: {
      id: 1,
      name: 'Default',
      icon: 'credit-card'
    }
  });

  const { execute, isLoading: isApiLoading } = useApi({
    showSuccessToast: true,
    successMessage: t('paymentUpdatedSuccess'),
    showErrorToast: true,
    defaultErrorMessage: t('failedToAddPayment')
  });

  const { execute: executeGetSources, isLoading: isSourcesLoading } = useApi({
    showErrorToast: true,
    defaultErrorMessage: t('failedToLoadPaymentSources')
  });

  const { settings } = useAppSettings();
  const { showToast } = useToast();
  const { showRewardedAd } = useRewardedAd();

  useEffect(() => {
    loadPaymentSources();
  }, [settings]);

  const validateForm = () => {
    if (!payment.from?.trim()) {
      showToast(t('paymentFromRequired'), 'error');
      return false;
    }
    if (payment.from.trim().length < 3) {
      showToast(t('paymentFromTooShort'), 'error');
      return false;
    }
    if (!payment.description?.trim()) {
      showToast(t('paymentDescriptionRequired'), 'error');
      return false;
    }
    if (payment.description.trim().length < 3) {
      showToast(t('paymentDescriptionTooShort'), 'error');
      return false;
    }

    const numericAmount = typeof payment.amount === 'number'
      ? payment.amount
      : parseFloat(String(payment.amount).replace(/[^0-9.]/g, '')); // Ensure only numeric for parsing

    if (isNaN(numericAmount) || numericAmount <= 0) {
      showToast(t('invalidPaymentAmount'), 'error');
      return false;
    }
    if (!String(payment.amount)?.trim()) { // Also check if amount is empty string
      showToast(t('paymentAmountRequired'), 'error');
      return false;
    }

    if (payment.source_id === 0 || !payment.source_id) { // Check for 0 or undefined
      showToast(t('paymentSourceRequired'), 'error');
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
        amount: parseFloat(String(payment.amount)),
        from: typeof payment.from === 'string' ? payment.from.trim() : '',
        description: typeof payment.description === 'string' ? payment.description.trim() : '',
        source_id: payment.source_id,
        user_id: user?.id,
      };

      const result = await execute(() => api.post('/payments', paymentData));
      if (result) {
        await showRewardedAd();
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
        if (payment.source_id === 1 && settings.payment_sources.length > 0) {
          setPayment({ ...payment, source_id: settings.payment_sources[0].id });
        }
      } else {
        const response = await executeGetSources(() => api.get('/payments/sources'));
        if (response?.data && response.data.length > 0) {
          setPaymentSources(response.data);
          setPayment({ ...payment, source_id: response.data[0].id });
        }
      }
    } catch (error) {
      // Error handled by useApi
    }
  };

  if (isSourcesLoading) {
    return <PaymentFormSkeleton />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1">
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
                if (date) {
                  setSelectedDate(date);
                  setPayment({ ...payment, date: formatDateForAPI(date) });
                }
              }}
            />
          )}

          <View className="mt-6 space-y-4">
            <View>
              <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
                {t('from')} <Text style={{ color: COLORS.error }}>*</Text>
              </Text>
              <TextInput
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.gray[200],
                  color: COLORS.secondary,
                }}
                placeholder={t('fromExample')}
                placeholderTextColor={COLORS.gray[300]}
                value={payment.from}
                onChangeText={(text) => setPayment({ ...payment, from: text })}
              />
            </View>

            <View>
              <Text className="mb-3 text-sm" style={{ color: COLORS.gray[400] }}>
                {t('paymentMethod')} <Text style={{ color: COLORS.error }}>*</Text>
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
                      {getLocalizedName(source, locale)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text className="mb-2 mt-3 text-sm" style={{ color: COLORS.gray[400] }}>
                {t('amount')} <Text style={{ color: COLORS.error }}>*</Text>
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
                  value={String(payment.amount)}
                  keyboardType="decimal-pad"
                  onChangeText={(text) => {
                    let numericText = text.replace(/[^0-9.]/g, '');

                    const parts = numericText.split('.');
                    if (parts.length > 2) {
                      numericText = parts[0] + '.' + parts.slice(1).join('');
                    }

                    if (parts.length === 2 && parts[1].length > 2) {
                      numericText = parts[0] + '.' + parts[1].substring(0, 2);
                    }

                    setPayment({ ...payment, amount: numericText });
                  }}
                />
              </View>
              <Text className="mt-1 text-xs" style={{ color: COLORS.gray[400] }}>
                {t('enterAmountInRupees')}
              </Text>
            </View>

            <View>
              <Text className="mb-2 mt-3 text-sm" style={{ color: COLORS.gray[400] }}>
                {t('notes')}
              </Text>
              <TextInput
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.gray[200],
                  color: COLORS.secondary,
                  height: 100,
                }}
                placeholder={t('addPaymentDetails')}
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
            opacity: isSaving || isApiLoading ? 0.7 : 1,
          }}>
          <Text className="text-center text-lg font-semibold text-white">
            {isSaving || isApiLoading ? t('saving') : t('savePayment')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
