import { Text, View, TextInput, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function WorkEntry() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState([{ id: 1, type: 'Regular', diamond: '', price: '' }]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const calculateTotal = () => {
    return entries.reduce((sum, entry) => sum + (Number(entry.price) || 0), 0);
  };

  const addEntry = () => {
    if (entries.length >= 10) {
      Alert.alert('Maximum Limit', 'You can add up to 10 entries only.');
      return;
    }
    setEntries([...entries, { id: Date.now(), type: 'Regular', diamond: '', price: '' }]);
  };

  const removeEntry = (id: number) => {
    if (entries.length === 1) {
      Alert.alert('Cannot Remove', 'At least one entry is required.');
      return;
    }
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Date Selector */}
      <View className="bg-white p-4 shadow-sm">
        <View className="mb-2 flex-row items-center">
          <MaterialCommunityIcons name="calendar-month" size={20} color="#4B5563" />
          <Text className="ml-2 text-base font-medium text-gray-600">Work Date</Text>
        </View>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center justify-center rounded-lg border border-gray-300 p-3">
          <Text className="text-center text-lg">{format(selectedDate, 'MMMM dd, yyyy')}</Text>
          <Ionicons name="chevron-down" size={20} color="#4B5563" className="ml-2" />
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

      {/* Entries Table */}
      <View className="flex-1 p-4">
        {/* Headers */}
        <View className="flex-row items-center justify-between rounded-t-lg bg-gray-100 p-3">
          <View className="flex-1 flex-row items-center">
            <FontAwesome5 name="tag" size={14} color="#4B5563" />
            <Text className="ml-2 font-medium text-gray-700">Type</Text>
          </View>
          <View className="flex-1 flex-row items-center">
            <MaterialCommunityIcons name="diamond-stone" size={16} color="#4B5563" />
            <Text className="ml-2 font-medium text-gray-700">Diamond</Text>
          </View>
          <View className="flex-1 flex-row items-center">
            <FontAwesome5 name="dollar-sign" size={14} color="#4B5563" />
            <Text className="ml-2 font-medium text-gray-700">Price</Text>
          </View>
          <Text className="w-16 text-right font-medium text-gray-700">Total</Text>
          <View className="w-10" />
        </View>

        {/* Entries */}
        <View className="rounded-b-lg bg-white shadow-sm">
          {entries.map((entry, index) => (
            <View
              key={entry.id}
              className={`flex-row items-center justify-between p-3 ${
                index !== entries.length - 1 ? 'border-b border-gray-200' : ''
              }`}>
              <View className="flex-1">
                <Pressable
                  onPress={() => {
                    setEntries(
                      entries.map((e) =>
                        e.id === entry.id
                          ? { ...e, type: e.type === 'Regular' ? 'Special' : 'Regular' }
                          : e
                      )
                    );
                  }}
                  className="flex-row items-center justify-center">
                  <MaterialCommunityIcons
                    name={entry.type === 'Regular' ? 'circle-slice-8' : 'star-circle'}
                    size={16}
                    color={entry.type === 'Regular' ? '#1D4ED8' : '#7E22CE'}
                  />
                  <Text
                    className={`
                    ml-1 rounded-full px-2 py-1 text-center
                    ${
                      entry.type === 'Regular'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }
                  `}>
                    {entry.type}
                  </Text>
                </Pressable>
              </View>
              <TextInput
                className="mx-1 flex-1 rounded-lg border border-gray-300 px-2 py-1.5"
                value={entry.diamond}
                placeholder="Enter"
                onChangeText={(text) => {
                  setEntries(entries.map((e) => (e.id === entry.id ? { ...e, diamond: text } : e)));
                }}
              />
              <TextInput
                className="mx-1 flex-1 rounded-lg border border-gray-300 px-2 py-1.5"
                value={entry.price}
                placeholder="0.00"
                keyboardType="numeric"
                onChangeText={(text) => {
                  setEntries(entries.map((e) => (e.id === entry.id ? { ...e, price: text } : e)));
                }}
              />
              <Text className="w-16 text-right">${Number(entry.price) || 0}</Text>
              <Pressable onPress={() => removeEntry(entry.id)} className="w-10 items-center">
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Add Button */}
        <Pressable
          onPress={addEntry}
          className="mt-4 flex-row items-center justify-center rounded-lg bg-blue-500 p-3">
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="ml-2 text-center font-medium text-white">Add New Entry</Text>
        </Pressable>

        {/* Footer */}
        <View className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="cash-multiple" size={24} color="#2563EB" />
              <Text className="ml-2 text-lg font-medium text-gray-700">Total Amount</Text>
            </View>
            <Text className="text-xl font-bold text-blue-600">${calculateTotal().toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
