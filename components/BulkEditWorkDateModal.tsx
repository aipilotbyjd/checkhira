import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { COLORS } from '../constants/theme'; // Adjust path as needed
import { useLanguage } from '../contexts/LanguageContext'; // Adjust path as needed

interface BulkEditWorkDateModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (newDate: Date) => void;
  currentSelectedCount: number;
}

const BulkEditWorkDateModal: React.FC<BulkEditWorkDateModalProps> = ({ visible, onClose, onApply, currentSelectedCount }) => {
  const { t } = useLanguage();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios'); // Show directly on iOS

  useEffect(() => {
    if (visible) {
      setDate(new Date()); // Reset to today's date when modal becomes visible
      if (Platform.OS === 'ios') {
        setShowDatePicker(true); // Ensure picker is shown on iOS when modal opens
      }
    }
  }, [visible]);

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
      if (Platform.OS === 'ios') {
        // On iOS, the picker is always visible in the modal, so no need to hide/show
        // but we might want to apply immediately or wait for an apply button.
        // For now, we just update the date. The apply button will use this state.
      }
    }
  };

  const handleApply = () => {
    onApply(date);
  };
  
  const openDatePickerForAndroid = () => {
    if (Platform.OS === 'android') {
      setShowDatePicker(true);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{t('bulkEditWorkDateTitle', { count: currentSelectedCount })}</Text>
          
          <Text style={styles.label}>{t('selectNewDate')}</Text>
          {Platform.OS === 'android' && (
            <Pressable onPress={openDatePickerForAndroid} style={styles.dateDisplayAndroid}>
              <Text style={styles.dateTextAndroid}>{date.toLocaleDateString()}</Text>
            </Pressable>
          )}

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'} // 'inline' for iOS to embed, 'default' for Android to open dialog
              onChange={onChangeDate}
              style={Platform.OS === 'ios' ? styles.iosPicker : {}}
              textColor={Platform.OS === 'ios' ? COLORS.secondary : undefined}
            />
          )}

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose}
            >
              <Text style={styles.textStyleCancel}>{t('cancel')}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonApply]}
              onPress={handleApply}
            >
              <Text style={styles.textStyleApply}>{t('applyToSelected', { count: currentSelectedCount })}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  label: {
    fontSize: 16,
    color: COLORS.gray[600],
    marginBottom: 8,
  },
  dateDisplayAndroid: {
    borderColor: COLORS.gray[300],
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary
  },
  dateTextAndroid: {
    fontSize: 16,
    color: COLORS.secondary
  },
  iosPicker: {
    height: 180, // Adjust as needed for 'inline' display
    borderRadius: 8,
    marginBottom:10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonApply: {
    backgroundColor: COLORS.primary,
  },
  buttonCancel: {
    backgroundColor: COLORS.gray[200],
  },
  textStyleApply: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textStyleCancel: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BulkEditWorkDateModal; 