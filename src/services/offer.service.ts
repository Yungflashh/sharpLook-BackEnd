import prisma from "../config/prisma";

export const createServiceOffer = async (
  clientId: string,
  data: any,
  serviceImage: string
) => {
  const requiredFields = [
    "serviceName",
    "serviceType",
    "offerAmount",
    "date",
    "time",
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  return await prisma.serviceOffer.create({
    data: {
      clientId,
      serviceName: data.serviceName,
      serviceType: data.serviceType,
      offerAmount: Number(data.offerAmount),
      date: data.date,
      time: data.time,
      latitude: data.latitude ? parseFloat(data.latitude) : undefined,
      longitude: data.longitude ? parseFloat(data.longitude) : undefined,
      serviceImage,
      expiresAt,
    },
  });
};



export const getVendorsForOffer = async (offerId: string) => {
  return await prisma.vendorOffer.findMany({
    where: { serviceOfferId: offerId },
    include: { vendor: true }
  });
};

export const vendorAcceptOffer = async (vendorId: string, offerId: string) => {
    const existing = await prisma.vendorOffer.findFirst({
  where: { vendorId, serviceOfferId: offerId }
});
if (existing) {
  throw new Error("You’ve already accepted this offer.");
}



  return await prisma.vendorOffer.create({
    data: {
      vendorId,
      serviceOfferId: offerId
    }
  });
};

export const selectVendorForOffer = async (offerId: string, selectedVendorId: string) => {
  // Update offer status
  await prisma.serviceOffer.update({
    where: { id: offerId },
    data: { status: "SELECTED" }
  });

  // Mark the selected vendor
  await prisma.vendorOffer.updateMany({
    where: { serviceOfferId: offerId },
    data: { isAccepted: false }
  });

  await prisma.vendorOffer.updateMany({
    where: {
      serviceOfferId: offerId,
      vendorId: selectedVendorId
    },
    data: { isAccepted: true }
  });
};



const EARTH_RADIUS_KM = 6371;

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export const getNearbyOffersByCoordinates = async (vendorId: string) => {
  const vendor = await prisma.user.findUnique({
    where: { id: vendorId },
    include: {
      vendorOnboarding: true,
    },
  });

  if (
    !vendor?.vendorOnboarding?.latitude ||
    !vendor?.vendorOnboarding?.longitude
  ) {
    throw new Error("Vendor coordinates not found.");
  }

 const allOffers = await prisma.serviceOffer.findMany({
  where: {
    status: "PENDING",
    expiresAt: { gte: new Date() }, 
  },
  include: {
    client: true,
  },
});

  const nearbyOffers = allOffers.filter((offer: any) => {
    if (!offer.latitude || !offer.longitude) return false;

    const distance = haversineDistance(
      vendor.vendorOnboarding!.latitude!,
      vendor.vendorOnboarding!.longitude!,
      offer.latitude,
      offer.longitude
    );

    return distance <= 10; // limit to 10km radius
  });

  return nearbyOffers;
};


export const cancelOffer = async (offerId: string, clientId: string) => {
  return await prisma.serviceOffer.updateMany({
    where: { id: offerId, clientId },
    data: { status: "CANCELLED" },
  });
};


export const getAllAvailableOffers = async () => {
  return prisma.serviceOffer.findMany({
    where: {
      status: "PENDING", // or whatever your "open" status is
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      client: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};
