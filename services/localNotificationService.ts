
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

class LocalNotificationService {
  static async initialize() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
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
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Monthly Summary',
        body: `This month: ${summary.works} works, ₹${summary.total_amount} total earnings`,
        data: { type: 'summary' },
      },
      trigger: {
        day: 1, // First day of every month
        hour: 9, // 9 AM
        minute: 0,
        repeats: true,
      },
    });
  }
}

export default LocalNotificationService;
