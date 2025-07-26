import prisma from "../config/prisma"
import {haversineDistanceKm} from "../utils/distance"

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


export const deleteNotification = async (notificationId: string) => {
  return await prisma.notification.delete({
    where: { id: notificationId },
  });
};


export const notifyNearbyVendors = async (offer: any) => {
  const vendors = await prisma.user.findMany({
    where: {
      role: "VENDOR",
      vendorOnboarding: {
        NOT: {
          latitude: null,
        },
      },
    },
    include: {
      vendorOnboarding: true,
    },
  });

  const filtered = vendors.filter((vendor) => {
    const coords = vendor.vendorOnboarding;
    if (!coords!.latitude || !coords!.longitude) return false;

    const distance = haversineDistanceKm(
      coords!.latitude,
      coords!.longitude,
      offer.latitude,
      offer.longitude
    );

    return distance <= 10;
  });

  const notifications = filtered.map((vendor) => ({
    userId: vendor.id,
    type: "OFFER",
    message: `New service offer: ${offer.serviceName} - ₦${offer.offerAmount}`,
    metadata: { offerId: offer.id },
  }));

  await prisma.notification.createMany({ data: notifications });
};

