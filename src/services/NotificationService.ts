import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class NotificationService {
  async createNotification(userId: string, message: string, type: string) {
    return prisma.notification.create({
      data: {
        userId,
        message,
        type,
        read: false,
      },
    });
  }

  async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }
}
