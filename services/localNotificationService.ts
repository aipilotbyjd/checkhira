
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Set up notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class LocalNotificationService {
  static async initialize() {
    // Check if physical device (push notifications only work on physical devices)
    if (!Device.isDevice) {
      console.log('Push Notifications are not available on emulators/simulators');
      return false;
    }

    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token permission!');
      return false;
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  }

  // Dummy method for push token (removed to fix ExpoPushTokenManager error)
  static async getExpoPushToken() {
    console.log('Push token functionality is disabled');
    return null;
  }

  static async scheduleWorkNotification(workData: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'New Work Added',
        body: `New work entry added for ${workData.diamond_count} diamonds`,
        data: { type: 'work', id: workData.id },
      },
      trigger: null, // Send immediately
    });
  }

  static async schedulePaymentNotification(paymentData: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'New Payment Added',
        body: `New payment of ₹${paymentData.amount} received`,
        data: { type: 'payment', id: paymentData.id },
      },
      trigger: null,
    });
  }

  static async scheduleMonthlySummary(summary: any) {
    // Schedule for immediate delivery instead of using a complex trigger
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Monthly Summary',
        body: `This month: ${summary.works} works, ₹${summary.total_amount} total earnings`,
        data: { type: 'summary' },
      },
      trigger: null, // Send immediately
    });
  }
}

export default LocalNotificationService;
