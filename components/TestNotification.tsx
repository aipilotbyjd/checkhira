import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useNotification } from '../contexts/NotificationContext';
import { COLORS, SPACING } from '../constants/theme';

export const TestNotification = () => {
  const { sendLocalNotification } = useNotification();

  const sendTestNotification = async () => {
    await sendLocalNotification(
      'Test Notification',
      'This is a test notification to verify that notifications are working properly.',
      { type: 'test', timestamp: Date.now() }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Notifications</Text>
      <Text style={styles.description}>
        Press the button below to send a test notification. This will help verify that notifications
        are working properly on your device.
      </Text>
      <Pressable style={styles.button} onPress={sendTestNotification}>
        <Text style={styles.buttonText}>Send Test Notification</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginVertical: SPACING.md,
    marginHorizontal: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    color: COLORS.secondary,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
});
