import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { Octicons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DeleteConfirmationModal } from '../../../components/DeleteConfirmationModal';
import { SuccessModal } from '../../../components/SuccessModal';
import { usePaymentOperations } from '../../../hooks/usePaymentOperations';

interface Payment {
  id: number;
  amount: string;
  category?: string;
  description?: string;
  source_id: number;
}

interface PaymentSource {
  id: number;
  name: string;
  icon: string;
}

export default function EditPayment() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [payment, setPayment] = useState<Payment>({
    id: Number(id),
    amount: '',
    category: '',
    description: '',
    source_id: 0,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([]);
  const { updatePayment, deletePayment, getPayment, getPaymentSources, isLoading } =
    usePaymentOperations();
  const [isLoadingSources, setIsLoadingSources] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingSources(true);
      if (!id) return;

      const data = await getPayment(Number(id));
      if (data) {
        setPayment(data);
        const parsedDate = new Date(data.date);
        setSelectedDate(
          parsedDate instanceof Date && !isNaN(parsedDate.getTime()) ? parsedDate : new Date()
        );
      }

      const sources = await getPaymentSources();
      if (sources) {
        setPaymentSources(sources);
      }
      setIsLoadingSources(false);
    };

    loadData();
  }, [id]);

  const handleUpdate = async () => {
    if (!payment.description || !payment.amount) {
      Alert.alert('Invalid Entry', 'Please fill in all fields');
      return;
    }

    const paymentData = {
      date: selectedDate,
      amount: payment.amount,
      category: payment.category,
      description: payment.description.trim(),
      source_id: payment.source_id,
    };

    const result = await updatePayment(Number(id), paymentData);
    if (result) {
      setShowSuccessModal(true);
    }
  };

  const handleDelete = async () => {
    const result = await deletePayment(Number(id));
    if (result) {
      setShowSuccessModal(true);
      router.back();
    }
  };

  const renderPaymentSourcesSkeleton = () => (
    <View className="flex-row flex-wrap gap-2">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="flex-row items-center rounded-full px-4 py-2"
          style={{
            backgroundColor: COLORS.gray[100],
            width: 120,
            height: 40,
          }}
        />
      ))}
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: COLORS.background.primary }}>
      <ScrollView className="flex-1">
        <View className="px-6 pt-6">
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center rounded-2xl p-4"
            style={{ backgroundColor: COLORS.gray[100] }}>
            <Octicons name="calendar" size={24} color={COLORS.primary} />
            <Text className="ml-3 flex-1 text-base" style={{ color: COLORS.gray[600] }}>
              {selectedDate instanceof Date && !isNaN(selectedDate.getTime())
                ? format(selectedDate, 'MMMM dd, yyyy')
                : 'Select a date'}
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

          <View className="mt-6 space-y-4">
            {/* <View>
              <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
                Description <Text style={{ color: COLORS.error }}>*</Text>
              </Text>
              <TextInput
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.gray[200],
                  color: COLORS.secondary,
                }}
                placeholder="e.g., Monthly Rent, Electricity Bill"
                placeholderTextColor={COLORS.gray[300]}
                value={payment.description}
                onChangeText={(text) => setPayment({ ...payment, description: text })}
              />
            </View>

            <View>
              <Text className="mb-2 text-sm" style={{ color: COLORS.gray[400] }}>
                Category
              </Text>
              <TextInput
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.gray[200],
                  color: COLORS.secondary,
                }}
                placeholder="e.g., Housing, Utilities, Food"
                placeholderTextColor={COLORS.gray[300]}
                value={payment.category}
                onChangeText={(text) => setPayment({ ...payment, category: text })}
              />
            </View> */}

            <View>
              <Text className="mb-3 text-sm" style={{ color: COLORS.gray[400] }}>
                Payment Source <Text style={{ color: COLORS.error }}>*</Text>
              </Text>
              {isLoadingSources ? (
                renderPaymentSourcesSkeleton()
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {paymentSources.map((source) => (
                    <Pressable
                      key={source.id}
                      onPress={() => setPayment({ ...payment, source_id: source.id })}
                      className={`flex-row items-center rounded-full px-4 py-2 ${
                        payment.source_id === source.id ? 'bg-primary' : 'bg-white'
                      }`}
                      style={{
                        borderWidth: 1,
                        borderColor:
                          payment.source_id === source.id ? COLORS.primary : COLORS.gray[200],
                      }}>
                      <MaterialCommunityIcons
                        name={source.icon as any}
                        size={20}
                        color={payment.source_id === source.id ? COLORS.black : COLORS.secondary}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={{
                          color: payment.source_id === source.id ? COLORS.black : COLORS.secondary,
                        }}>
                        {source.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View>
              <Text className="mb-2 mt-3 text-sm" style={{ color: COLORS.gray[400] }}>
                Amount <Text style={{ color: COLORS.error }}>*</Text>
              </Text>
              <View className="relative">
                <TextInput
                  className="rounded-xl border p-3"
                  style={{
                    backgroundColor: COLORS.white,
                    borderColor: COLORS.gray[200],
                    color: COLORS.secondary,
                  }}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.gray[300]}
                  value={payment.amount}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    setPayment({ ...payment, amount: numericText });
                  }}
                />
              </View>
              <Text className="mt-1 text-xs" style={{ color: COLORS.gray[400] }}>
                Enter amount in dollars
              </Text>
            </View>

            <View>
              <Text className="mb-2 mt-3 text-sm" style={{ color: COLORS.gray[400] }}>
                Notes
              </Text>
              <TextInput
                className="rounded-xl border p-3"
                style={{
                  backgroundColor: COLORS.white,
                  borderColor: COLORS.gray[200],
                  color: COLORS.secondary,
                  height: 100,
                }}
                placeholder="Add any additional details about this payment"
                placeholderTextColor={COLORS.gray[300]}
                multiline={true}
                textAlignVertical="top"
                value={payment.description}
                onChangeText={(text) => setPayment({ ...payment, description: text })}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="space-y-3 p-6">
        <Pressable
          onPress={handleUpdate}
          className="mb-4 rounded-2xl p-4"
          style={{ backgroundColor: COLORS.primary }}>
          <Text className="text-center text-lg font-semibold text-white">Update Payment</Text>
        </Pressable>

        <Pressable
          onPress={handleDelete}
          className="rounded-2xl p-4"
          style={{ backgroundColor: COLORS.error + '15' }}>
          <Text className="text-center text-lg font-semibold" style={{ color: COLORS.error }}>
            Delete Payment
          </Text>
        </Pressable>
      </View>

      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          console.log('Deleting payment:', id);
          setShowDeleteModal(false);
          setShowSuccessModal(true);
        }}
        message="Are you sure you want to delete this payment?"
      />

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        message={showDeleteModal ? 'Payment deleted successfully' : 'Payment updated successfully'}
      />
    </View>
  );
}
