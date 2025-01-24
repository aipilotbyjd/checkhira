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
import { COLORS } from '../../../constants/theme';
import { DeleteConfirmationModal } from '../../../components/DeleteConfirmationModal';
import { SuccessModal } from '../../../components/SuccessModal';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useWorkOperations } from '../../../hooks/useWorkOperations';
import { formatDateForAPI, parseCustomDate } from '../../../utils/dateFormatter';
import { WorkEntry, WorkFormData, WorkResponse } from '../../../types/work';
import { useToast } from '../../../contexts/ToastContext';

export default function EditWork() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { updateWork, deleteWork, getWork, isLoading } = useWorkOperations();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<WorkFormData>({
    date: new Date(),
    name: '',
    entries: [],
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteEntryModal, setShowDeleteEntryModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<WorkEntry | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadWorkEntry = async () => {
      if (!id) return;

      try {
        const response = await getWork(Number(id));
        const data = response?.data;

        if (data) {
          setFormData({
            date: parseCustomDate(data?.date),
            name: data?.name,
            entries: data?.work_items.map((item: any) => ({
              id: item.id,
              type: item.type,
              diamond: item.diamond?.toString() || '',
              price: item.price?.toString() || '',
            })),
          });
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load work entry. Please try again.');
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
      Alert.alert('Maximum Limit', 'You can add up to 10 entries only.');
      return;
    }
    const lastEntry = formData.entries[formData.entries.length - 1];
    const nextType = getNextType(lastEntry.type);
    setFormData({
      ...formData,
      entries: [...formData.entries, { id: Date.now(), type: nextType, diamond: '', price: '' }],
    });
  };

  const removeEntry = (entryId?: number) => {
    if (formData.entries.length === 1) {
      Alert.alert('Cannot Remove', 'At least one entry is required.');
      return;
    }
    const entryToDelete = entryId
      ? formData.entries.find((e) => e.id === entryId)
      : formData.entries[formData.entries.length - 1];
    setShowDeleteEntryModal(true);
    setEntryToDelete(entryToDelete || null);
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Required Field', 'Please enter a name.');
      return;
    }

    // Validate entries
    const hasEmptyFields = formData.entries.some((entry) => !entry.diamond || !entry.price);
    if (hasEmptyFields) {
      Alert.alert('Invalid Entries', 'Please fill in all diamond and price fields.');
      return;
    }

    const workData = {
      date: formatDateForAPI(formData.date),
      name: formData.name.trim(),
      entries: formData.entries,
      total: calculateTotal(),
    };

    try {
      const result = await updateWork(Number(id), workData);
      if (result) {
        showToast('Work entry updated successfully!');
        router.replace('/(tabs)/work-list');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update work entries. Please try again.');
      showToast('Something went wrong!', 'error');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteWork(Number(id));
      if (result) {
        showToast('Work entry deleted successfully!');
        router.replace('/(tabs)/work-list');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete work entry. Please try again.');
      showToast('Something went wrong!', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
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
          Name <Text style={{ color: COLORS.error }}>*</Text>
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
          placeholder="Enter name"
          placeholderTextColor={COLORS.gray[400]}
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView className="mt-6 flex-1 px-6">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
            Entries
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
                  Entry {index + 1}
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
                  Diamond
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
                  Price
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
                  Total
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
                Total Amount
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
            className="mb-4 rounded-2xl p-4"
            style={{ backgroundColor: COLORS.primary }}>
            <Text className="text-center text-lg font-semibold text-white">Update Entries</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowDeleteModal(true)}
            className="mb-4 rounded-2xl p-4"
            style={{ backgroundColor: COLORS.error + '15' }}>
            <Text className="text-center text-lg font-semibold" style={{ color: COLORS.error }}>
              Delete Work Entry
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Delete Entry/Work Confirmation Modal */}
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
          } else {
            // Delete entire work entry
            console.log('Deleting work:', id);
            setShowDeleteEntryModal(false);
            showToast('Work entry deleted successfully!');
          }
        }}
        message={
          entryToDelete
            ? `Are you sure you want to remove Entry ${
                formData.entries.findIndex((e) => e.id === entryToDelete.id) + 1
              } (Type ${entryToDelete.type})?`
            : 'Are you sure you want to delete these entries?'
        }
      />

      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          handleDelete();
          setShowDeleteModal(false);
        }}
        message="Are you sure you want to delete this work entry?"
      />
    </View>
  );
}
