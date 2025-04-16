
import { Platform } from 'react-native';

class LocalNotificationService {
  static async initialize() {
    console.log('Local notification service initialized');
    return true;
  }

  // Dummy method for push token (removed to fix ExpoPushTokenManager error)
  static async getExpoPushToken() {
    console.log('Push token functionality is disabled');
    return null;
  }

  static async scheduleWorkNotification(workData: any) {
    console.log('Work notification scheduled (dummy)', workData);
    return null;
  }

  static async schedulePaymentNotification(paymentData: any) {
    console.log('Payment notification scheduled (dummy)', paymentData);
    return null;
  }

  static async scheduleMonthlySummary(summary: any) {
    console.log('Monthly summary notification scheduled (dummy)', summary);
    return null;
  }
}

export default LocalNotificationService;
