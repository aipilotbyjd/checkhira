import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants/theme'; // Adjust path as needed
import { useLanguage } from '../contexts/LanguageContext'; // Adjust path as needed

interface BulkEditPaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (newPaymentMethodId: string) => void; // Assuming you pass an ID or a key
  // You might want to pass paymentSources here if they are dynamic
  // paymentSources: Array<{ id: string; name: string; icon: string }>; 
}

const BulkEditPaymentMethodModal: React.FC<BulkEditPaymentMethodModalProps> = ({ visible, onClose, onApply }) => {
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<string>(''); // Default or first available

  // Placeholder payment methods - replace with your actual sources
  const paymentMethods = [
    { id: 'cash', name: t('cash') },
    { id: 'bankTransfer', name: t('bankTransfer') },
    { id: 'upi', name: t('upi') },
    { id: 'cheque', name: t('cheque') },
    { id: 'other', name: t('other') },
  ];

  // Set initial selectedMethod if paymentMethods is not empty
  useState(() => {
    if (paymentMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(paymentMethods[0].id);
    }
  });

  const handleApply = () => {
    if (selectedMethod) {
      onApply(selectedMethod);
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
          <Text style={styles.modalTitle}>{t('bulkEditPaymentMethodTitle')}</Text>

          <Text style={styles.label}>{t('selectNewPaymentMethod')}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedMethod}
              onValueChange={(itemValue) => setSelectedMethod(itemValue as string)}
              style={styles.picker}
              dropdownIconColor={COLORS.secondary}
            >
              {paymentMethods.map((method) => (
                <Picker.Item key={method.id} label={method.name} value={method.id} />
              ))}
            </Picker>
          </View>

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
              disabled={!selectedMethod}
            >
              <Text style={styles.textStyleApply}>{t('applyChanges')}</Text>
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  pickerContainer: {
    borderColor: COLORS.gray[300],
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: COLORS.background.secondary,
  },
  picker: {
    height: 50,
    width: '100%',
    color: COLORS.secondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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

export default BulkEditPaymentMethodModal; 