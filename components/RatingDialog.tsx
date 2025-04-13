
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

interface RatingDialogProps {
  visible: boolean;
  onClose: () => void;
  onRate: () => void;
  translations: {
    enjoyingApp: string;
    rateExperience: string;
    notNow: string;
    rateNow: string;
  };
}

export const RatingDialog = ({ visible, onClose, onRate, translations }: RatingDialogProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <MaterialCommunityIcons name="star-face" size={64} color={COLORS.primary} />
          <Text style={styles.title}>{translations.enjoyingApp}</Text>
          <Text style={styles.message}>{translations.rateExperience}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>{translations.notNow}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={onRate}>
              <Text style={styles.primaryButtonText}>{translations.rateNow}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 340,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
