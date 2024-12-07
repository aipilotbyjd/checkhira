import { Text, View, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { MaterialCommunityIcons, Ionicons, FontAwesome5, Octicons } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../constants/theme';

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
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      {/* Header Section */}
      <View className="px-6 pt-6" style={SHADOWS.small}>
        <Text style={{ 
          fontSize: SIZES.h2, 
          color: COLORS.secondary,
          fontWeight: 'bold',
          marginBottom: SPACING.md 
        }}>
          Work Entry
        </Text>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center rounded-2xl"
          style={{ 
            backgroundColor: COLORS.gray[100],
            padding: SPACING.md,
            marginBottom: SPACING.lg
          }}>
          <MaterialCommunityIcons name="calendar-month" size={SIZES.iconSize.medium} color={COLORS.primary} />
          <Text className="flex-1 ml-3" style={{ 
            fontSize: SIZES.body,
            color: COLORS.gray[600]
          }}>
            {format(selectedDate, 'MMMM dd, yyyy')}
          </Text>
          <Ionicons name="chevron-down" size={SIZES.iconSize.small} color={COLORS.gray[400]} />
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
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          padding: SPACING.screenPadding,
          paddingBottom: SPACING.xxl 
        }}>
        {/* Entries Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text style={{ 
            fontSize: SIZES.h3,
            color: COLORS.secondary,
            fontWeight: '600'
          }}>
            Entries
          </Text>
          <View className="flex-row space-x-3">
            <Pressable 
              onPress={removeEntry}
              className="p-2 rounded-full"
              style={{ backgroundColor: COLORS.error + '15' }}>
              <Octicons name="trash" size={SIZES.iconSize.small} color={COLORS.error} />
            </Pressable>
            <Pressable 
              onPress={addEntry}
              className="p-2 rounded-full"
              style={{ backgroundColor: COLORS.primary + '15' }}>
              <Octicons name="plus" size={SIZES.iconSize.small} color={COLORS.primary} />
            </Pressable>
          </View>
        </View>

        {/* Entry Cards */}
        {entries.map((entry, index) => (
          <View
            key={entry.id}
            className="mb-4 rounded-2xl"
            style={{ 
              backgroundColor: COLORS.background.secondary,
              padding: SPACING.md,
              ...SHADOWS.small
            }}>
            <View className="flex-row items-center mb-3">
              <Text style={{ 
                fontSize: SIZES.caption,
                color: COLORS.gray[400]
              }}>
                Entry {index + 1}
              </Text>
              <View className="ml-2 px-3 py-1 rounded-full" 
                style={{ backgroundColor: COLORS.primary + '15' }}>
                <Text style={{ color: COLORS.primary, fontWeight: '600' }}>{entry.type}</Text>
              </View>
            </View>
            
            <View className="flex-row space-x-3">
              {/* Input Fields */}
              <View className="flex-1">
                <Text style={{ 
                  fontSize: SIZES.caption,
                  color: COLORS.gray[400],
                  marginBottom: SPACING.xs
                }}>Diamond</Text>
                <TextInput
                  style={{ 
                    height: SIZES.inputHeight,
                    backgroundColor: COLORS.white,
                    borderRadius: SIZES.borderRadius,
                    borderColor: COLORS.gray[200],
                    padding: SPACING.sm,
                    fontSize: SIZES.body,
                    color: COLORS.secondary
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
              <View className="flex-1">
                <Text style={{ 
                  fontSize: SIZES.caption,
                  color: COLORS.gray[400],
                  marginBottom: SPACING.xs
                }}>Price</Text>
                <TextInput
                  style={{ 
                    height: SIZES.inputHeight,
                    backgroundColor: COLORS.white,
                    borderRadius: SIZES.borderRadius,
                    borderColor: COLORS.gray[200],
                    padding: SPACING.sm,
                    fontSize: SIZES.body,
                    color: COLORS.secondary
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
                <Text style={{ 
                  fontSize: SIZES.caption,
                  color: COLORS.gray[400],
                  marginBottom: SPACING.xs
                }}>Total</Text>
                <View className="bg-white rounded-xl p-3 border border-gray-200">
                  <Text className="text-base text-gray-700">
                    ₹ {((Number(entry.diamond) || 0) * (Number(entry.price) || 0)).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View className="px-6 pb-6" style={SHADOWS.medium}>
        <View className="rounded-2xl mb-4" 
          style={{ 
            backgroundColor: COLORS.primary + '10',
            padding: SPACING.md
          }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialCommunityIcons 
                name="cash-multiple" 
                size={SIZES.iconSize.medium} 
                color={COLORS.primary} 
              />
              <Text style={{ 
                marginLeft: SPACING.sm,
                fontSize: SIZES.h3,
                color: COLORS.secondary,
                fontWeight: '600'
              }}>
                Total Amount
              </Text>
            </View>
            <Text style={{ 
              fontSize: SIZES.h2,
              color: COLORS.primary,
              fontWeight: 'bold'
            }}>
              ₹ {calculateTotal().toFixed(2)}
            </Text>
          </View>
        </View>

        <Pressable 
          onPress={handleSave}
          className="rounded-2xl"
          style={{ 
            backgroundColor: COLORS.primary,
            padding: SPACING.md,
            ...SHADOWS.small
          }}>
          <Text style={{ 
            textAlign: 'center',
            color: COLORS.white,
            fontSize: SIZES.h4,
            fontWeight: '600'
          }}>
            Save Entries
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
