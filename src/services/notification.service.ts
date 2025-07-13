import prisma from "../config/prisma"

export const createNotification = async (
  userId: string,
  message: string,
  type: string = "BOOKING"
) => {
  return await prisma.notification.create({
    data: {
      userId,
      message,
      type,
    },
  })
}

export const getUserNotifications = async (userId: string) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
}
