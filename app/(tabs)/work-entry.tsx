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
    const lastEntry = entries[entries.length - 1];
    const nextType = getNextType(lastEntry.type);
    setEntries([...entries, { id: Date.now(), type: nextType, diamond: '', price: '' }]);
  };

  const removeEntry = () => {
    if (entries.length === 1) {
      Alert.alert('Cannot Remove', 'At least one entry is required.');
      return;
    }
    setEntries(entries.slice(0, -1));
  };


  const handleSave = () => {
    // TODO: Implement save functionality
    Alert.alert('Success', 'Entries saved successfully!');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Date Selector */}
      <View className="px-6 pt-6">
        <Text className="text-2xl font-bold text-gray-800 mb-4">Work Entry</Text>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center bg-gray-50 p-4 rounded-2xl">
          <MaterialCommunityIcons name="calendar-month" size={24} color="#3B82F6" />
          <Text className="flex-1 ml-3 text-base text-gray-600">
            {format(selectedDate, 'MMMM dd, yyyy')}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#94A3B8" />
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

      {/* Entries Section */}
      <View className="flex-1 px-6 mt-8">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-gray-700">Entries</Text>
          <View className="flex-row space-x-2">
            <Pressable 
              onPress={removeEntry}
              className="p-2 rounded-full bg-red-50">
              <Octicons name="trash" size={20} color="#EF4444" />
            </Pressable>
            <Pressable 
              onPress={addEntry}
              className="p-2 rounded-full bg-blue-50">
              <Octicons name="plus" size={20} color="#3B82F6" />
            </Pressable>
          </View>
        </View>

        {/* Entry Cards */}
        {entries.map((entry, index) => (
          <View
            key={entry.id}
            className="mb-4 bg-gray-50 rounded-2xl p-4">
            <View className="flex-row items-center mb-3">
              <Text className="text-sm font-medium text-gray-500">Entry {index + 1}</Text>
              <View className="ml-2 px-3 py-1 rounded-full bg-blue-100">
                <Text className="text-blue-700 font-medium">{entry.type}</Text>
              </View>
            </View>
            
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Diamond</Text>
                <TextInput
                  className="bg-white rounded-xl p-3 text-base border border-gray-200"
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
              <View className="flex-1">
                <Text className="text-sm text-gray-500 mb-1">Price</Text>
                <TextInput
                  className="bg-white rounded-xl p-3 text-base border border-gray-200"
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
                <Text className="text-sm text-gray-500 mb-1">Total</Text>
                <View className="bg-white rounded-xl p-3 border border-gray-200">
                  <Text className="text-base text-gray-700">
                    ₹ {((Number(entry.diamond) || 0) * (Number(entry.price) || 0)).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View className="px-6 pb-6">
        <View className="bg-blue-50 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="cash-multiple" size={24} color="#3B82F6" />
              <Text className="ml-3 text-lg font-semibold text-gray-700">Total Amount</Text>
            </View>
            <Text className="text-xl font-bold text-blue-600">₹ {calculateTotal().toFixed(2)}</Text>
          </View>
        </View>

        <Pressable 
          onPress={handleSave}
          className="bg-blue-600 rounded-2xl p-4 shadow-sm">
          <Text className="text-center text-white font-semibold text-lg">Save Entries</Text>
        </Pressable>
      </View>
    </View>
  );
}
