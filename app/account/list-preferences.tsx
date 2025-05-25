import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../contexts/LanguageContext';
import { COLORS } from '../../constants/theme';
import { useAnalytics } from '../../hooks/useAnalytics';

export const PREFERENCE_KEYS = {
  WORK_SORT_FIELD: 'userPrefs_workListSortField',
  WORK_SORT_DIRECTION: 'userPrefs_workListSortDirection',
  PAYMENT_SORT_FIELD: 'userPrefs_paymentListSortField',
  PAYMENT_SORT_DIRECTION: 'userPrefs_paymentListSortDirection',
};

export default function ListPreferencesScreen() {
  useAnalytics('ListPreferencesScreen');
  const { t } = useLanguage();

  const [workSortField, setWorkSortField] = useState('date');
  const [workSortDirection, setWorkSortDirection] = useState('desc');
  const [paymentSortField, setPaymentSortField] = useState('date');
  const [paymentSortDirection, setPaymentSortDirection] = useState('desc');

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const wsField = await AsyncStorage.getItem(PREFERENCE_KEYS.WORK_SORT_FIELD);
        const wsDir = await AsyncStorage.getItem(PREFERENCE_KEYS.WORK_SORT_DIRECTION);
        const psField = await AsyncStorage.getItem(PREFERENCE_KEYS.PAYMENT_SORT_FIELD);
        const psDir = await AsyncStorage.getItem(PREFERENCE_KEYS.PAYMENT_SORT_DIRECTION);

        if (wsField) setWorkSortField(wsField);
        if (wsDir) setWorkSortDirection(wsDir);
        if (psField) setPaymentSortField(psField);
        if (psDir) setPaymentSortDirection(psDir);
      } catch (e) {
        console.error('Failed to load preferences.', e);
      }
    };
    loadPreferences();
  }, []);

  const savePreference = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error('Failed to save preference.', e);
    }
  };

  const handleWorkSortFieldChange = (value: string) => {
    setWorkSortField(value);
    savePreference(PREFERENCE_KEYS.WORK_SORT_FIELD, value);
  };

  const handleWorkSortDirectionChange = (value: string) => {
    setWorkSortDirection(value);
    savePreference(PREFERENCE_KEYS.WORK_SORT_DIRECTION, value);
  };

  const handlePaymentSortFieldChange = (value: string) => {
    setPaymentSortField(value);
    savePreference(PREFERENCE_KEYS.PAYMENT_SORT_FIELD, value);
  };

  const handlePaymentSortDirectionChange = (value: string) => {
    setPaymentSortDirection(value);
    savePreference(PREFERENCE_KEYS.PAYMENT_SORT_DIRECTION, value);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>{t('workListSortSettings')}</Text>
      <View style={styles.preferenceItem}>
        <Text style={styles.label}>{t('sortBy')}</Text>
        <Picker
          selectedValue={workSortField}
          style={styles.picker}
          onValueChange={handleWorkSortFieldChange}
          dropdownIconColor={COLORS.secondary}
        >
          <Picker.Item label={t('date')} value="date" />
          <Picker.Item label={t('name')} value="name" />
          <Picker.Item label={t('totalAmount')} value="total_amount" />
        </Picker>
      </View>
      <View style={styles.preferenceItem}>
        <Text style={styles.label}>{t('sortDirection')}</Text>
        <Picker
          selectedValue={workSortDirection}
          style={styles.picker}
          onValueChange={handleWorkSortDirectionChange}
          dropdownIconColor={COLORS.secondary}
        >
          <Picker.Item label={t('descending')} value="desc" />
          <Picker.Item label={t('ascending')} value="asc" />
        </Picker>
      </View>

      <Text style={styles.header}>{t('paymentListSortSettings')}</Text>
      <View style={styles.preferenceItem}>
        <Text style={styles.label}>{t('sortBy')}</Text>
        <Picker
          selectedValue={paymentSortField}
          style={styles.picker}
          onValueChange={handlePaymentSortFieldChange}
          dropdownIconColor={COLORS.secondary}
        >
          <Picker.Item label={t('date')} value="date" />
          <Picker.Item label={t('from')} value="from" />
          <Picker.Item label={t('amount')} value="amount" />
        </Picker>
      </View>
      <View style={styles.preferenceItem}>
        <Text style={styles.label}>{t('sortDirection')}</Text>
        <Picker
          selectedValue={paymentSortDirection}
          style={styles.picker}
          onValueChange={handlePaymentSortDirectionChange}
          dropdownIconColor={COLORS.secondary}
        >
          <Picker.Item label={t('descending')} value="desc" />
          <Picker.Item label={t('ascending')} value="asc" />
        </Picker>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 15,
    marginTop: 20,
  },
  preferenceItem: {
    marginBottom: 20,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  label: {
    fontSize: 16,
    color: COLORS.gray[600],
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    color: COLORS.secondary,
  },
}); 