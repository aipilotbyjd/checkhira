import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, Pressable, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { Octicons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DeleteConfirmationModal } from '../../../components/DeleteConfirmationModal';
import { SuccessModal } from '../../../components/SuccessModal';
import { usePaymentOperations } from '../../../hooks/usePaymentOperations';
import { useToast } from '../../../contexts/ToastContext';
import { PaymentFormSkeleton } from '~/components/PaymentFormSkeleton';
import { useAuth } from '../../../contexts/AuthContext';
import { useApi } from '../../../hooks/useApi';
import { api } from '../../../services/axiosClient';
import { formatDateForAPI, parseCustomDate } from '../../../utils/dateFormatter';
import { PaymentSource } from '../../../types/payment';
import { useLanguage } from '../../../contexts/LanguageContext';
import { BannerAdComponent } from '../../../components/ads';
import { useRewardedAd } from '../../../components/ads/RewardedAdComponent';

// TODO: Review this local Payment interface. Consider using the global one from types/payment.ts if applicable.
interface Payment {
  id: number;
  amount: string;
  from?: string;
  category?: string;
  description?: string;
  source_id: number;
  user_id?: number;
  // date?: string; // The global type might have a date field, ensure consistency or reason for difference
}

// Moved renderPaymentSourcesSkeleton outside the component
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

// Define getLocalizedName outside the component (if needed for payment source display)
const getLocalizedName = (source: PaymentSource, currentLocale: string): string => {
  const key = `name_${currentLocale}` as keyof PaymentSource;
  return (source[key] as string) || source.name;
};

export default function EditPayment() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [payment, setPayment] = useState<Payment>({
    id: Number(id),
    amount: '',
    from: '',
    category: '',
    description: '',
    source_id: 0,
    user_id: user?.id,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([]);
  const { updatePayment, deletePayment, getPayment, getPaymentSources, isLoading } =
    usePaymentOperations();
  const [isLoadingSources, setIsLoadingSources] = useState(true);
  const { showToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t, locale } = useLanguage();
  const { showRewardedAd } = useRewardedAd();

  const { execute, isLoading: isApiLoading } = useApi({
    showSuccessToast: true,
    successMessage: t('paymentUpdatedSuccess'),
    showErrorToast: true,
    defaultErrorMessage: t('failedToUpdatePayment')
  });

  const { execute: executeDelete, isLoading: isDeleteLoading } = useApi({
    showSuccessToast: true,
    successMessage: 'Payment deleted successfully!',
    showErrorToast: true,
    defaultErrorMessage: 'Failed to delete payment. Please try again.'
  });

  const { execute: executeGet, isLoading: isLoadingData } = useApi({
    showErrorToast: true,
    defaultErrorMessage: 'Failed to load payment. Please try again.'
  });

  const { execute: executeGetSources, isLoading: isSourcesLoading } = useApi({
    showErrorToast: true,
    defaultErrorMessage: 'Failed to load payment sources. Please try again.'
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingSources(true);
      if (!id) return;

      const data = await getPayment(Number(id));
      if (data) {
        setPayment(data as Payment);
        const parsedDate = new Date(data.date);
        setSelectedDate(
          parsedDate instanceof Date && !isNaN(parsedDate.getTime()) ? parsedDate : new Date()
        );
      }

      const sources = await getPaymentSources();
      if (sources) {
        setPaymentSources(sources);
      }
      setIsLoadingSources(false);
    };

    loadData();
  }, [id]);

  const handleInputChange = useCallback((field: keyof Payment, value: string) => {
    setPayment(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSourceChange = useCallback((sourceId: number) => {
    setPayment(prev => ({ ...prev, source_id: sourceId }));
  }, []);

  const handleAmountChange = useCallback((text: string) => {
    const numericText = text.replace(/[^0-9.]/g, '');
    // Allow only one decimal point
    const parts = numericText.split('.');
    let processedText = numericText;
    if (parts.length > 2) {
      processedText = parts[0] + '.' + parts.slice(1).join('');
    }
    setPayment(prev => ({ ...prev, amount: processedText }));
  }, []);

  const handleUpdate = async () => {
    if (!payment.from?.trim()) {
      showToast(t('paymentFromRequired'), 'error');
      return;
    }
    if (payment.from.trim().length < 3) {
      showToast(t('paymentFromTooShort'), 'error');
      return;
    }
    if (!payment.description?.trim()) {
      showToast(t('paymentDescriptionRequired'), 'error');
      return;
    }
    if (payment.description.trim().length < 3) {
      showToast(t('paymentDescriptionTooShort'), 'error');
      return;
    }
    if (!payment.amount) {
      showToast(t('paymentAmountRequired'), 'error');
      return;
    }

    const numericAmount = parseFloat(payment.amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showToast(t('invalidPaymentAmount'), 'error');
      return;
    }
    if (payment.source_id === 0) {
      showToast(t('paymentSourceRequired'), 'error');
      return;
    }

    const paymentData = {
      date: selectedDate,
      amount: numericAmount,
      from: payment.from?.trim(),
      category: payment.category || undefined,
      description: payment.description.trim(),
      source_id: payment.source_id,
      user_id: user?.id,
    };

    try {
      setIsUpdating(true);

      // `execute` from useApi handles success/error toasts
      const result = await execute(() => api.put(`/payments/${id}`, paymentData));

      if (result) { // `execute` throws on error, so this means success
        // Ad after successful update
        await showRewardedAd();
        router.replace('/(tabs)/payments'); // Navigate after ad
      }
    } catch (error) {
      // Error is already handled by useApi's showErrorToast
      // No need to show ad if update failed
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    // setShowDeleteModal(false); // Moved to finally or after success
    try {
      setIsDeleting(true);

      // `executeDelete` from useApi handles success/error toasts
      const result = await executeDelete(() => api.delete(`/payments/${id}`));

      if (result) { // `executeDelete` throws on error, so this means success
        // Ad after successful delete
        await showRewardedAd();
        router.replace('/(tabs)/payments'); // Navigate after ad
      }
    } catch (error) {
      // Error is already handled by useApi's showErrorToast
      // No need to show ad if delete failed
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false); // Ensure modal is closed
    }
  };

  if (isLoading) {
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
            <Octicons name="calendar" size={24} color={COLORS.primary} />
            <Text className="ml-3 flex-1 text-base" style={{ color: COLORS.gray[600] }}>
              {selectedDate instanceof Date && !isNaN(selectedDate.getTime())
                ? format(selectedDate, 'MMMM dd, yyyy')
                : 'Select a date'}
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
                {t('from')} <Text style={{ color: COLORS.error }}>*</Text>
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
                onChangeText={(text) => handleInputChange('from', text)}
              />
            </View>

            <View>
              <Text className="mb-3 text-sm" style={{ color: COLORS.gray[400] }}>
                {t('paymentMethod')} <Text style={{ color: COLORS.error }}>*</Text>
              </Text>
              {isLoadingSources ? (
                renderPaymentSourcesSkeleton()
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {paymentSources.map((source) => (
                    <Pressable
                      key={source.id}
                      onPress={() => handleSourceChange(source.id)}
                      className={`flex-row items-center rounded-full px-4 py-2 ${payment.source_id === source.id ? 'bg-primary' : 'bg-white'}`}>
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
              )}
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
                  value={payment.amount}
                  keyboardType="numeric"
                  onChangeText={handleAmountChange}
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
                value={payment.description || ''}
                onChangeText={(text) => handleInputChange('description', text)}
              />
            </View>
          </View>

          {/* Banner ad at the top of the form */}
          <BannerAdComponent
            containerStyle={{ marginVertical: 10 }}
          />
        </View>
      </ScrollView>

      <View className="space-y-3 p-6">
        <Pressable
          onPress={handleUpdate}
          disabled={isUpdating || isApiLoading}
          className="mb-4 rounded-2xl p-4"
          style={{
            backgroundColor: isUpdating || isApiLoading ? COLORS.gray[300] : COLORS.primary,
            opacity: isUpdating || isApiLoading ? 0.7 : 1,
          }}>
          <Text className="text-center text-lg font-semibold text-white">
            {isUpdating || isApiLoading ? t('Updating...') : t('updatePayment')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setShowDeleteModal(true)}
          className="rounded-2xl p-4"
          style={{ backgroundColor: COLORS.error + '15' }}>
          <Text className="text-center text-lg font-semibold" style={{ color: COLORS.error }}>
            {t('deletePayment')}
          </Text>
        </Pressable>
      </View>

      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          handleDelete();
          setShowDeleteModal(false);
        }}
        message={t('deletePaymentConfirmation')}
      />

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.replace('/(tabs)/payments');
        }}
        message={isDeleting ? t('paymentDeletedSuccess') : t('paymentUpdatedSuccess')}
      />
    </View>
  );
}
