import {
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parse } from 'date-fns';
import { MaterialCommunityIcons, Ionicons, Octicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { DeleteConfirmationModal } from '../../../components/DeleteConfirmationModal';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { formatDateForAPI, parseCustomDate } from '../../../utils/dateFormatter';
import { WorkEntry, WorkFormData } from '../../../types/work';
import { useToast } from '../../../contexts/ToastContext';
import { WorkFormSkeleton } from '../../../components/WorkFormSkeleton';
import { useAppRating } from '../../../hooks/useAppRating';
import { useAuth } from '../../../contexts/AuthContext';
import { useApi } from '../../../hooks/useApi';
import { api, ApiError } from '../../../services/axiosClient';
import { useWorkOperations } from '../../../hooks/useWorkOperations';
import { useLanguage } from '../../../contexts/LanguageContext';
import { BannerAdComponent } from '../../../components/ads';
import { useInterstitialAd } from '../../../components/ads/InterstitialAdComponent';

export default function EditWork() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showToast } = useToast();
  const { trackPositiveAction } = useAppRating();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showInterstitialAd } = useInterstitialAd();

  const { getWork, updateWork, deleteWork, isLoading } = useWorkOperations();

  const [formData, setFormData] = useState<WorkFormData>({
    date: new Date(),
    name: '',
    entries: [],
    user_id: user?.id,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteWorkModal, setShowDeleteWorkModal] = useState(false);
  const [showDeleteEntryModal, setShowDeleteEntryModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<WorkEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { execute, isLoading: isApiLoading } = useApi({
    showSuccessToast: true,
    successMessage: 'Work entry updated successfully!',
    showErrorToast: true,
    defaultErrorMessage: 'Failed to update work entry. Please try again.'
  });

  const { execute: executeDelete, isLoading: isDeleteLoading } = useApi({
    showSuccessToast: true,
    successMessage: 'Work entry deleted successfully!',
    showErrorToast: true,
    defaultErrorMessage: 'Failed to delete work entry. Please try again.'
  });

  const { execute: executeGet, isLoading: isLoadingData } = useApi({
    showErrorToast: true,
    defaultErrorMessage: 'Failed to load work entry. Please try again.'
  });

  useEffect(() => {
    const loadWorkEntry = async () => {
      if (!id) return;

      try {
        const response = await executeGet(() => api.get(`/works/${id}`));
        if (response?.data) {
          const data = response.data;
          setFormData({
            date: parseCustomDate(data?.date),
            name: data?.name,
            entries: data?.work_items.map((item: any) => ({
              id: item.id,
              type: item.type,
              diamond: item.diamond?.toString() || '',
              price: item.price?.toString() || '',
            })),
            user_id: user?.id,
          });
        }
      } catch (error) {
        router.back();
      }
    };

    loadWorkEntry();
  }, [id]);

  const calculateTotal = () => {
    return formData.entries.reduce((sum, entry) => {
      const diamond = Number(entry.diamond) || 0;
      const price = Number(entry.price) || 0;
      return sum + diamond * price;
    }, 0);
  };

  const getNextType = (currentType: string) => {
    const types = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const currentIndex = types.indexOf(currentType);
    return types[(currentIndex + 1) % types.length];
  };

  const addEntry = () => {
    if (formData.entries.length >= 10) {
      showToast('You can add up to 10 entries only.', 'error');
      return;
    }
    const lastEntry = formData.entries[formData.entries.length - 1];
    const nextType = lastEntry ? getNextType(lastEntry.type) : 'A';
    setFormData({
      ...formData,
      entries: [...formData.entries, { id: Date.now(), type: nextType, diamond: '', price: '' }],
    });
  };

  const removeEntry = (entryId?: number) => {
    if (formData.entries.length === 1) {
      showToast('At least one entry is required.', 'error');
      return;
    }
    const entryToDelete = entryId
      ? formData.entries.find((e) => e.id === entryId)
      : formData.entries[formData.entries.length - 1];
    setShowDeleteEntryModal(true);
    setEntryToDelete(entryToDelete || null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      showToast(t('enterName'), 'error');
      return false;
    }

    // Validate entries
    const hasEmptyFields = formData.entries.some((entry) => !entry.diamond || !entry.price);
    if (hasEmptyFields) {
      showToast(t('invalidInput'), 'error');
      return false;
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm() || isUpdating) return;

    setIsUpdating(true);
    const workData = {
      date: formatDateForAPI(formData.date),
      name: formData.name.trim(),
      entries: formData.entries,
      total: calculateTotal(),
      user_id: user?.id,
    };

    try {
      const response = await execute(() => api.put(`/works/${id}`, workData)); // `execute` from useApi handles success/error toasts
    
      if (response) { // `execute` will throw on error, so if we are here, it's a success
        await trackPositiveAction();
        // Ad after successful update and positive action tracking
        await showInterstitialAd(); 
        router.replace('/(tabs)/work-list'); // Navigate after ad
      }
    } catch (error) {
      // Error is already handled by useApi's showErrorToast
      // console.error("Update failed:", error); // Optional: for local debugging
      // Do NOT show ad if update failed
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteWorkModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setShowDeleteWorkModal(false);

    try {
      // Assuming deleteWork is from useWorkOperations and handles its own toasts/errors
      // And returns a truthy value on success
      const success = await deleteWork(Number(id)); 
    
      if (success) {
        // Ad after successful delete
        await showInterstitialAd();
        router.back(); // Navigate after ad
      }
      // If deleteWork internally throws an error, the catch block in useWorkOperations should handle it.
      // If it returns false for failure, we might need an else here to show a generic error toast if not already handled.
    } catch (error) {
        // This catch block is if deleteWork itself throws an unhandled error
        // or if there's an issue not caught by useWorkOperations.
        // useWorkOperations should ideally handle its own error toasts.
        console.error("Delete operation failed:", error);
        showToast(t('failedToDeleteWork'), 'error'); // Show a fallback error toast
        // Do NOT show ad if delete failed
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoadingData || isApiLoading || isDeleteLoading) {
    return <WorkFormSkeleton />;
  }

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
            {format(formData.date, 'MMMM dd, yyyy')}
          </Text>
          <Ionicons name="chevron-down" size={20} color={COLORS.gray[400]} />
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            mode="date"
            display="spinner"
            value={formData.date}
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setFormData({ ...formData, date });
            }}
          />
        )}
      </View>

      {/* Add name field */}
      <View className="px-6">
        <Text className="mb-2 mt-3 text-sm" style={{ color: COLORS.gray[400] }}>
          {t('name')} <Text style={{ color: COLORS.error }}>*</Text>
        </Text>
        <TextInput
          className="rounded-xl border p-3"
          style={{
            backgroundColor: COLORS.white,
            borderColor: COLORS.gray[200],
            color: COLORS.secondary,
          }}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder={t('enterName')}
          placeholderTextColor={COLORS.gray[400]}
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView className="mt-6 flex-1 px-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
            {t('works')}
          </Text>
          <View className="flex-row items-center justify-end space-x-2">
            <Pressable
              onPress={() => removeEntry()}
              className="mr-2 rounded-lg p-2"
              style={{ backgroundColor: COLORS.error + '15' }}>
              <Octicons name="trash" size={20} color={COLORS.error} />
            </Pressable>
            <Pressable
              onPress={addEntry}
              className="rounded-lg p-2"
              style={{ backgroundColor: COLORS.primary + '15' }}>
              <Octicons name="plus" size={20} color={COLORS.primary} />
            </Pressable>
          </View>
        </View>

        {/* Entry Cards */}
        {formData.entries.map((entry, index) => (
          <View
            key={entry.id}
            className="mb-4 rounded-2xl p-4"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <View className="mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Text className="text-sm" style={{ color: COLORS.gray[400] }}>
                  {t('workItemDetails')} {index + 1}
                </Text>
                <View
                  className="ml-2 rounded-full px-3 py-1"
                  style={{ backgroundColor: COLORS.primary + '15' }}>
                  <Text style={{ color: COLORS.primary }}>{entry.type}</Text>
                </View>
              </View>
              {index !== 0 && (
                <Pressable
                  onPress={() => removeEntry(entry.id)}
                  className="rounded-lg p-2"
                  style={{ backgroundColor: COLORS.error + '15' }}>
                  <Octicons name="trash" size={16} color={COLORS.error} />
                </Pressable>
              )}
            </View>

            <View className="flex-row space-x-3">
              <View className="mr-2 flex-1">
                <Text className="mb-1 text-sm" style={{ color: COLORS.gray[400] }}>
                  {t('diamondWeight')}
                </Text>
                <TextInput
                  className="rounded-xl border p-3"
                  style={{
                    backgroundColor: COLORS.white,
                    borderColor: COLORS.gray[200],
                    color: COLORS.secondary,
                  }}
                  value={entry.diamond}
                  placeholder="0"
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, '');
                    setFormData({
                      ...formData,
                      entries: formData.entries.map((e) =>
                        e.id === entry.id ? { ...e, diamond: numericText } : e
                      ),
                    });
                  }}
                />
              </View>
              <View className="mr-2 flex-1">
                <Text className="mb-1 text-sm" style={{ color: COLORS.gray[400] }}>
                  {t('price')}
                </Text>
                <TextInput
                  className="rounded-xl border p-3"
                  style={{
                    backgroundColor: COLORS.white,
                    borderColor: COLORS.gray[200],
                    color: COLORS.secondary,
                  }}
                  value={entry.price}
                  placeholder="0.00"
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    setFormData({
                      ...formData,
                      entries: formData.entries.map((e) =>
                        e.id === entry.id ? { ...e, price: numericText } : e
                      ),
                    });
                  }}
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-sm" style={{ color: COLORS.gray[400] }}>
                  {t('total')}
                </Text>
                <View
                  className="rounded-xl border bg-gray-200 p-3"
                  style={{ borderColor: COLORS.gray[200] }}>
                  <Text style={{ color: COLORS.secondary }}>
                    ₹ {((Number(entry.diamond) || 0) * (Number(entry.price) || 0)).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Banner Ad */}
      <View className="px-6">
        <BannerAdComponent />
      </View>

      {/* Footer */}
      <View className="px-6 pb-6">
        <View className="mb-4 rounded-2xl p-4" style={{ backgroundColor: COLORS.primary + '10' }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="cash-multiple" size={24} color={COLORS.primary} />
              <Text className="ml-3 text-lg font-semibold" style={{ color: COLORS.secondary }}>
                {t('totalPrice')}
              </Text>
            </View>
            <Text className="text-xl font-bold" style={{ color: COLORS.primary }}>
              ₹ {calculateTotal().toFixed(2)}
            </Text>
          </View>
        </View>

        <View className="space-y-3">
          <Pressable
            onPress={handleUpdate}
            disabled={isUpdating}
            className="mb-4 rounded-2xl p-4"
            style={{ backgroundColor: COLORS.primary }}>
            <Text className="text-center text-lg font-semibold text-white">
              {isUpdating ? t('Updating...') : t('editWork')}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDelete}
            disabled={isDeleting}
            className="mb-4 rounded-2xl p-4"
            style={{ backgroundColor: COLORS.error }}>
            <Text className="text-center text-lg font-semibold text-white">
              {isDeleting ? t('Deleting...') : t('deleteWork')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Delete Entry Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showDeleteEntryModal}
        onClose={() => {
          setShowDeleteEntryModal(false);
          setEntryToDelete(null);
        }}
        onConfirm={() => {
          if (entryToDelete) {
            setFormData({
              ...formData,
              entries: formData.entries.filter((e) => e.id !== entryToDelete.id),
            });
            setShowDeleteEntryModal(false);
            setEntryToDelete(null);
          }
        }}
        title={t('confirmDelete')}
        message={
          entryToDelete
            ? t('deleteConfirmation') + ` ${formData.entries.findIndex((e) => e.id === entryToDelete.id) + 1
            } (Type ${entryToDelete.type})?`
            : ''
        }
      />

      {/* Delete Work Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showDeleteWorkModal}
        onClose={() => setShowDeleteWorkModal(false)}
        onConfirm={confirmDelete}
        title={t('deleteWork')}
        message={t('deleteWorkConfirmation')}
      />
    </View>
  );
}
