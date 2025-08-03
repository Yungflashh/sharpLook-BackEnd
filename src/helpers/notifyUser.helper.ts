import prisma from "../config/prisma";
import { pushNotificationService } from "../services/pushNotifications.service";

export const notifyUser = async (userId: string, title: string, body: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (user?.fcmToken) {
      await pushNotificationService.sendPushNotification(user.fcmToken, title, body);
    } else {
      console.log(`No FCM token found for user ${userId}, skipping push notification.`);
    }
  } catch (error) {
    console.error(`Failed to send push notification to user ${userId}:`, error);
  }
};
