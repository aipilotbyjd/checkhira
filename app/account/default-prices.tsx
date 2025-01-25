import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultPrice, DefaultPriceFormData } from '../../types/work';
import { useRouter } from 'expo-router';
import { useToast } from '../../contexts/ToastContext';

const DEFAULT_TYPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

export default function DefaultPrices() {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<DefaultPriceFormData>({
    prices: DEFAULT_TYPES.map((type, index) => ({
      id: index + 1,
      type,
      price: '',
    })),
  });

  useEffect(() => {
    loadDefaultPrices();
  }, []);

  const loadDefaultPrices = async () => {
    try {
      const savedPrices = await AsyncStorage.getItem('defaultPrices');
      if (savedPrices) {
        setFormData({ prices: JSON.parse(savedPrices) });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load default prices');
    }
  };

  const updatePrice = (id: number, value: string) => {
    setFormData({
      prices: formData.prices.map((price) =>
        price.id === id ? { ...price, price: value } : price
      ),
    });
  };

  const handleSave = async () => {
    try {
      // Only save prices that have values
      const validPrices = formData.prices.filter(price => price.price.trim() !== '');
      await AsyncStorage.setItem('defaultPrices', JSON.stringify(validPrices));
      showToast('Default prices saved successfully!');
      router.replace('/(tabs)/account');
    } catch (error) {
      showToast('Something went wrong!', 'error');
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1 px-6 pt-6">
        <View className="mb-4 flex-row items-center">
          <MaterialCommunityIcons name="diamond-stone" size={24} color={COLORS.primary} />
          <Text className="ml-3 text-lg font-semibold" style={{ color: COLORS.secondary }}>
            Default Diamond Prices
          </Text>
        </View>

        {formData.prices.map((price) => (
          <View
            key={price.id}
            className="mb-4 rounded-2xl p-4"
            style={{ backgroundColor: COLORS.background.secondary }}>
            <View className="mb-3 flex-row items-center">
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: COLORS.primary + '15' }}>
                <Text style={{ color: COLORS.primary }}>Type {price.type}</Text>
              </View>
            </View>

            <TextInput
              className="rounded-xl border p-3"
              style={{
                backgroundColor: COLORS.white,
                borderColor: COLORS.gray[200],
                color: COLORS.secondary,
              }}
              value={price.price}
              placeholder="Enter default price"
              keyboardType="numeric"
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9.]/g, '');
                updatePrice(price.id, numericText);
              }}
            />
          </View>
        ))}
      </ScrollView>

      <View className="px-6 pb-6">
        <Pressable
          onPress={handleSave}
          className="rounded-2xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Save Default Prices</Text>
        </Pressable>
      </View>
    </View>
  );
}
