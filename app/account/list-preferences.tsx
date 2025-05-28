import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../../contexts/LanguageContext';
import { COLORS, FONTS, SPACING, SIZES } from '../../constants/theme';
import { useAnalytics } from '../../hooks/useAnalytics';

export const PREFERENCE_KEYS = {
  WORK_SORT_FIELD: 'userPrefs_workListSortField',
  WORK_SORT_DIRECTION: 'userPrefs_workListSortDirection',
  PAYMENT_SORT_FIELD: 'userPrefs_paymentListSortField',
  PAYMENT_SORT_DIRECTION: 'userPrefs_paymentListSortDirection',
};

// New CustomSegmentedControl Component
interface CustomSegmentedControlProps {
  options: Array<{ label: string; value: string }>;
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const CustomSegmentedControl: React.FC<CustomSegmentedControlProps> = ({ options, selectedValue, onValueChange }) => {
  return (
    <View style={styles.segmentedControlContainer}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          style={[
            styles.segment,
            selectedValue === option.value && styles.segmentSelected,
          ]}
          onPress={() => onValueChange(option.value)}
        >
          <Text style={[styles.segmentLabel, selectedValue === option.value && styles.segmentLabelSelected]}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
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
      <View style={styles.preferenceCard}>
        <Text style={styles.header}>{t('workListSortSettings')}</Text>
        <View style={styles.preferenceItem}>
          <Text style={styles.label}>{t('sortBy')}</Text>
          <View style={styles.pickerContainer}>
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
        </View>
        <View style={styles.preferenceItem}>
          <Text style={styles.label}>{t('sortDirection')}</Text>
          <CustomSegmentedControl
            options={[{ label: t('descending'), value: 'desc' }, { label: t('ascending'), value: 'asc' }]}
            selectedValue={workSortDirection}
            onValueChange={handleWorkSortDirectionChange}
          />
        </View>
      </View>

      <View style={styles.preferenceCard}>
        <Text style={styles.header}>{t('paymentListSortSettings')}</Text>
        <View style={styles.preferenceItem}>
          <Text style={styles.label}>{t('sortBy')}</Text>
          <View style={styles.pickerContainer}>
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
        </View>
        <View style={styles.preferenceItem}>
          <Text style={styles.label}>{t('sortDirection')}</Text>
          <CustomSegmentedControl
            options={[{ label: t('descending'), value: 'desc' }, { label: t('ascending'), value: 'asc' }]}
            selectedValue={paymentSortDirection}
            onValueChange={handlePaymentSortDirectionChange}
          />
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  preferenceCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  header: {
    fontSize: 20,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 20,
  },
  preferenceItem: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    color: COLORS.gray[700],
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: COLORS.secondary,
    backgroundColor: 'transparent',
  },
  segmentedControlContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray[200],
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
    height: 44,
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  segmentSelected: {
    backgroundColor: COLORS.primary,
    borderRadius: 7,
    margin: 2,
  },
  segmentLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    color: COLORS.gray[700],
  },
  segmentLabelSelected: {
    color: COLORS.white,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
}); 