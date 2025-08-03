// src/services/pushNotification.service.ts
import admin from '../utils/firebase';

export class PushNotificationService {
  async sendPushNotification(token: string, title: string, body: string): Promise<string> {
    const message = {
      token,
      notification: {
        title,
        body,
      },
    };

    const response = await admin.messaging().send(message);
    return response;
  }
}

export const pushNotificationService = new PushNotificationService();
