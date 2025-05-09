import {
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { MaterialCommunityIcons, Ionicons, Octicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { DeleteConfirmationModal } from '../../components/DeleteConfirmationModal';
import { useRouter } from 'expo-router';
import { useWorkOperations } from '../../hooks/useWorkOperations';
import { formatDateForAPI } from '../../utils/dateFormatter';
import { DefaultPrice, WorkEntry, WorkFormData } from '../../types/work';
import { useInterstitialAd } from '../../components/ads/InterstitialAdComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../../contexts/ToastContext';
import { WorkFormSkeleton } from '../../components/WorkFormSkeleton';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../hooks/useApi';
import { api, ApiError } from '../../services/axiosClient';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AddWork() {
  const router = useRouter();
  const { showToast } = useToast();
  const { execute, isLoading: isApiLoading } = useApi({
    showSuccessToast: true,
    successMessage: 'Work entries saved successfully!',
    showErrorToast: true,
    defaultErrorMessage: 'Failed to save work entries. Please try again.'
  });
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showInterstitialAd } = useInterstitialAd();

  const [formData, setFormData] = useState<WorkFormData>({
    date: new Date(),
    name: '',
    entries: [],
    user_id: user?.id,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<WorkEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const calculateTotal = () => {
    return formData.entries.reduce((sum, entry) => {
      const diamond = Number(entry.diamond) || 0;
      const price = Number(entry.price) || 0;
      return sum + diamond * price;
    }, 0);
  };

  const getNextType = (currentType: string) => {
    const types = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ];
    const currentIndex = types.indexOf(currentType);
    return types[(currentIndex + 1) % types.length];
  };

  useEffect(() => {
    initializeEntriesFromDefaults();
  }, []);

  const initializeEntriesFromDefaults = async () => {
    try {
      const savedPrices = await AsyncStorage.getItem('defaultPrices');
      if (savedPrices) {
        const prices = JSON.parse(savedPrices);
        const initialEntries = prices
          .filter((price: DefaultPrice) => price.price.trim() !== '')
          .map((price: DefaultPrice, index: number) => ({
            id: Date.now() + index,
            type: price.type,
            diamond: '',
            price: price.price,
          }));

        if (initialEntries.length > 0) {
          setFormData((prev) => ({
            ...prev,
            entries: initialEntries,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            entries: [{ id: Date.now(), type: 'A', diamond: '', price: '' }],
          }));
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          entries: [{ id: Date.now(), type: 'A', diamond: '', price: '' }],
        }));
      }
    } catch (error) {
      console.error('Failed to load default prices:', error);
      setFormData((prev) => ({
        ...prev,
        entries: [{ id: Date.now(), type: 'A', diamond: '', price: '' }],
      }));
    }
  };

  const addEntry = async () => {
    if (formData.entries.length >= 10) {
      showToast('You can add up to 10 entries only.', 'error');
      return;
    }

    try {
      const savedPrices = await AsyncStorage.getItem('defaultPrices');
      if (savedPrices) {
        const prices = JSON.parse(savedPrices).filter(
          (price: DefaultPrice) => price.price.trim() !== ''
        );
        const unusedPrice = prices.find(
          (price: DefaultPrice) => !formData.entries.some((entry) => entry.type === price.type)
        );

        if (unusedPrice) {
          setFormData({
            ...formData,
            entries: [
              ...formData.entries,
              {
                id: Date.now(),
                type: unusedPrice.type,
                diamond: '',
                price: unusedPrice.price,
              },
            ],
          });
        } else {
          const lastEntry = formData.entries[formData.entries.length - 1];
          const nextType = getNextType(lastEntry.type);
          setFormData({
            ...formData,
            entries: [
              ...formData.entries,
              {
                id: Date.now(),
                type: nextType,
                diamond: '',
                price: '',
              },
            ],
          });
        }
      } else {
        const lastEntry = formData.entries[formData.entries.length - 1];
        const nextType = getNextType(lastEntry.type);
        setFormData({
          ...formData,
          entries: [
            ...formData.entries,
            {
              id: Date.now(),
              type: nextType,
              diamond: '',
              price: '',
            },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to load default prices:', error);
      const lastEntry = formData.entries[formData.entries.length - 1];
      const nextType = getNextType(lastEntry.type);
      setFormData({
        ...formData,
        entries: [
          ...formData.entries,
          {
            id: Date.now(),
            type: nextType,
            diamond: '',
            price: '',
          },
        ],
      });
    }
  };

  const removeEntry = (entryId?: number) => {
    if (formData.entries.length === 1) {
      showToast('At least one entry is required.', 'error');
      return;
    }
    const entryToDelete = entryId
      ? formData.entries.find((e) => e.id === entryId)
      : formData.entries[formData.entries.length - 1];
    setShowDeleteModal(true);
    setEntryToDelete(entryToDelete || null);
  };

  const updateEntry = (id: number, field: keyof WorkEntry, value: string) => {
    setFormData({
      ...formData,
      entries: formData.entries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      ),
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      showToast(t('enterName'), 'error');
      return false;
    }

    const hasEmptyFields = formData.entries.some((entry) => !entry.diamond || !entry.price);
    if (hasEmptyFields) {
      showToast(t('invalidInput'), 'error');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || isSaving) return;

    setIsSaving(true);
    const workData = {
      date: formatDateForAPI(formData.date),
      name: formData.name.trim(),
      entries: formData.entries,
      total: calculateTotal(),
      user_id: user?.id,
    };

    // router.back(); // Navigation moved to after successful save and ad

    try {
      const result = await api.post('/works', workData);
      if (result) { // Assuming result indicates success
        // Data saved successfully
        showToast('Work entries saved successfully!'); // Show toast first

        // THEN show the interstitial ad
        await showInterstitialAd();

        // THEN navigate back
        // Ensure router is available here. If it's part of a conditional hook, ensure it's stable.
        if (router) {
          router.back();
        }
      }
      // No explicit else here, error toast will be handled by catch block
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to save work entries';
      showToast(errorMessage, 'error');
      // Do NOT show ad if saving failed
    } finally {
      setIsSaving(false);
    }
  };

  if (isApiLoading) {
    return <WorkFormSkeleton />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      {/* Date Picker Section */}
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
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) setFormData({ ...formData, date });
            }}
          />
        )}
      </View>

      {/* Name Field */}
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

      {/* Entries Section */}
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

        {formData.entries.map((entry, index) => (
          <View
            key={entry.id}
            className="mb-4 rounded-2xl p-4"
            style={{ backgroundColor: COLORS.background.secondary }}>
            {/* Entry Header */}
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

            {/* Entry Fields */}
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
                  placeholder={t('enterWeight')}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, '');
                    updateEntry(entry.id, 'diamond', numericText);
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
                  placeholder={t('enterPrice')}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    updateEntry(entry.id, 'price', numericText);
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

        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          className="mb-4 rounded-2xl p-4"
          style={{
            backgroundColor: isSaving ? COLORS.gray[400] : COLORS.primary,
            opacity: isSaving ? 0.7 : 1,
          }}>
          <Text className="text-center text-lg font-semibold text-white">
            {isSaving ? 'Saving...' : t('saveWork')}
          </Text>
        </Pressable>
      </View>

      {/* Modals */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setEntryToDelete(null);
        }}
        onConfirm={() => {
          setFormData({
            ...formData,
            entries: formData.entries.filter((e) => e.id !== entryToDelete?.id),
          });
          setShowDeleteModal(false);
          setEntryToDelete(null);
        }}
        message={`${t('deleteConfirmation')} ${formData.entries.findIndex((e) => e.id === entryToDelete?.id) + 1
          } (Type ${entryToDelete?.type})?`}
      />
    </View>
  );
}
