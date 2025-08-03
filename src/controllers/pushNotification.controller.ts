// src/controllers/pushNotification.controller.ts
import { Request, Response } from 'express';
import { pushNotificationService } from '../services/pushNotifications.service';

export class PushNotificationController {
  async sendTestPush(req: Request, res: Response): Promise<Response> {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    try {
      const response = await pushNotificationService.sendPushNotification(
        token,
        'Test',
        'This is a test push notification.'
      );
      return res.json({ success: true, response });
    } catch (error: any) {
      console.error('Push error:', error);
      return res.status(500).json({ error: 'Push failed', details: error.message });
    }
  }
}

export const pushNotificationController = new PushNotificationController();
