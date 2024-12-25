import { Text, View, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { MaterialCommunityIcons, Ionicons, Octicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { DeleteConfirmationModal } from '../../../components/DeleteConfirmationModal';
import { SuccessModal } from '../../../components/SuccessModal';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface WorkEntry {
  id: number;
  type: string;
  diamond: string;
  price: string;
}

export default function EditWork() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call
    setEntries([
      { id: 1, type: 'A', diamond: '10', price: '100' },
      { id: 2, type: 'B', diamond: '20', price: '200' },
    ]);
  }, [id]);

  // Rest of the functions (getNextType, addEntry, removeEntry, calculateTotal)
  // are the same as in AddWork component

  const handleUpdate = () => {
    // TODO: Implement API call to update work entries
    const workData = {
      id: Number(id),
      date: selectedDate,
      entries: entries,
      total: calculateTotal(),
    };

    console.log('Updating work:', workData);
    setShowSuccessModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  // Rest of the JSX is similar to AddWork component,
  // but with Update/Delete buttons instead of Save

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      {/* Same ScrollView content as AddWork */}

      <View className="space-y-3 p-6">
        <Pressable
          onPress={handleUpdate}
          className="mb-4 rounded-2xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Update Entries</Text>
        </Pressable>

        <Pressable
          onPress={handleDelete}
          className="rounded-2xl p-4"
          style={{ backgroundColor: COLORS.error + '15' }}>
          <Text className="text-center text-lg font-semibold" style={{ color: COLORS.error }}>
            Delete Entries
          </Text>
        </Pressable>
      </View>

      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          console.log('Deleting work:', id);
          setShowDeleteModal(false);
          setShowSuccessModal(true);
        }}
        message="Are you sure you want to delete these entries?"
      />

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        message={
          showDeleteModal ? 'Entries deleted successfully!' : 'Entries updated successfully!'
        }
      />
    </View>
  );
}
