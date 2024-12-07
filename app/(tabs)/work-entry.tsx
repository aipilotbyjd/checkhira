import { Text, View, TextInput, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { MaterialCommunityIcons, Ionicons, FontAwesome5, Octicons } from '@expo/vector-icons';

export default function WorkEntry() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState([{ id: 1, type: 'A', diamond: '', price: '' }]);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    setEntries([...entries, { id: Date.now(), type: 'A', diamond: '', price: '' }]);
  };

  const removeEntry = () => {
    if (entries.length === 1) {
      Alert.alert('Cannot Remove', 'At least one entry is required.');
      return;
    }
    setEntries(entries.slice(0, -1));
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
          <View className="flex-1 flex-row items-center justify-center">
            <Text className="ml-2 font-medium text-gray-700">Type</Text>
          </View>
          <View className="flex-1 flex-row items-center justify-center">
            <Text className="ml-2 font-medium text-gray-700">Diamond</Text>
          </View>
          <View className="flex-1 flex-row items-center justify-center">
            <Text className="ml-2 font-medium text-gray-700">Price</Text>
          </View>
          <View className="flex-1 flex-row items-center justify-center">
            <Text className="ml-2 font-medium text-gray-700">Total</Text>
          </View>
        </View>

        {/* Entries */}
        <View className="rounded-b-lg bg-white shadow-sm">
          {entries.map((entry, index) => (
            <View
              key={entry.id}
              className={`flex-row items-center justify-between p-3 ${
                index !== entries.length - 1 ? 'border-b border-gray-200' : ''
              }`}>
              <View className="flex-1 items-center">
                <Pressable
                  onPress={() => {
                    setEntries(
                      entries.map((e) =>
                        e.id === entry.id ? { ...e, type: getNextType(e.type) } : e
                      )
                    );
                  }}
                  className="flex-row items-center justify-center">
                  <Text className="rounded-full bg-blue-100 px-2 py-1 text-center text-blue-800">
                    {entry.type}
                  </Text>
                </Pressable>
              </View>
              <TextInput
                className="mx-1 flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-center"
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
              <TextInput
                className="mx-1 flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-center"
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
              <Text className="flex-1 text-center">
                ${((Number(entry.diamond) || 0) * (Number(entry.price) || 0)).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View className="mt-4 flex-row justify-between space-x-4">
          <View className="flex-1" />
          <View className="flex-row justify-between space-x-4">
            <Pressable onPress={removeEntry} className="mx-2 rounded-lg bg-red-500 p-3">
              <Octicons name="trash" size={24} color="white" />
            </Pressable>
            <Pressable onPress={addEntry} className="mx-2 rounded-lg bg-blue-500 p-3">
              <Octicons name="plus" size={24} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="cash-multiple" size={24} color="#2563EB" />
              <Text className="ml-2 text-lg font-medium text-gray-700">Total Amount</Text>
            </View>
            <Text className="text-xl font-bold text-blue-600">{calculateTotal().toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
