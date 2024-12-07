import { Text, View, TextInput, Pressable, Alert, ScrollView, Modal } from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { MaterialCommunityIcons, Ionicons, FontAwesome5, Octicons } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../constants/theme';

export default function WorkEntry() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState([{ id: 1, type: 'A', diamond: '', price: '' }]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const calculateTotal = () => {
    return entries.reduce((sum, entry) => {
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
    if (entries.length >= 10) {
      Alert.alert('Maximum Limit', 'You can add up to 10 entries only.');
      return;
    }
    const lastEntry = entries[entries.length - 1];
    const nextType = getNextType(lastEntry.type);
    setEntries([...entries, { id: Date.now(), type: nextType, diamond: '', price: '' }]);
  };

  const removeEntry = (entryId?: number) => {
    if (entries.length === 1) {
      Alert.alert('Cannot Remove', 'At least one entry is required.');
      return;
    }
    const entryToDelete = entryId 
      ? entries.find(e => e.id === entryId) 
      : entries[entries.length - 1];
    setShowDeleteModal(true);
    setEntryToDelete(entryToDelete);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    Alert.alert('Success', 'Entries saved successfully!');
  };

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
        {entries.map((entry, index) => (
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
                    setEntries(
                      entries.map((e) => (e.id === entry.id ? { ...e, diamond: numericText } : e))
                    );
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
                    setEntries(
                      entries.map((e) => (e.id === entry.id ? { ...e, price: numericText } : e))
                    );
                  }}
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-sm" style={{ color: COLORS.gray[400] }}>
                  Total
                </Text>
                <View
                  className="rounded-xl bg-gray-200 border p-3"
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

        <Pressable
          onPress={handleSave}
          className="rounded-2xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Save Entries</Text>
        </Pressable>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal transparent visible={showDeleteModal} animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="mx-4 w-[90%] rounded-2xl bg-white p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
                Confirm Delete
              </Text>
              <Pressable onPress={() => setShowDeleteModal(false)}>
                <Octicons name="x" size={20} color={COLORS.gray[400]} />
              </Pressable>
            </View>

            <Text className="mb-6" style={{ color: COLORS.gray[600] }}>
              Are you sure you want to remove Entry {entries.findIndex(e => e.id === entryToDelete?.id) + 1} (Type {entryToDelete?.type})?
            </Text>

            <View className="flex-row space-x-3">
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border p-3 mx-1"
                style={{ borderColor: COLORS.gray[200] }}>
                <Text className="text-center font-semibold" style={{ color: COLORS.gray[600] }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setEntries(entries.filter(e => e.id !== entryToDelete?.id));
                  setShowDeleteModal(false);
                  setEntryToDelete(null);
                }}
                className="flex-1 rounded-xl p-3 mx-1"
                style={{ backgroundColor: COLORS.error }}>
                <Text className="text-center font-semibold text-white">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
