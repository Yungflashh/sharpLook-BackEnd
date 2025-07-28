import prisma from "../config/prisma";
import * as bookingService from "../services/booking.service"
import { BookingStatus, PaymentStatus, Booking } from "@prisma/client";

// import * as serviceOfferBookingService from "../services/offerBooking.service";



export const createServiceOffer = async (
  clientId: string,
  data: any,
  serviceImage: string
) => {
  const requiredFields = [
    "serviceName",
    "serviceType",
    "offerAmount",
     "fullAddress",
    "landMark",
    "date",
    "time",
     "landMark",
      "fullAddress",
      "paymentMethod",
      "totalAmount"
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
      landMark : data.landMark,
      fullAddress : data.fullAddress,
      paymentMethod: data.paymentMethod,
      totalAmount : data.totalAmount ? parseFloat(data.totalAmount) : undefined,
    },
  });
};



export const getVendorsForOffer = async (offerId: string) => {
  const vendors = await prisma.vendorOffer.findMany({
    where: { serviceOfferId: offerId },
    include: {
      vendor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          vendorOnboarding: true,
          vendorServices: true,
          vendorReviews: true,
          vendorAvailabilities: true,
          products: true,
        },
      },
    },
  });

  return {
    offerId,
    totalVendors: vendors.length,
    vendors: vendors.map((entry) => entry.vendor),
  };
};

export const vendorAcceptOffer = async (vendorId: string, offerId: string) => {
  const existing = await prisma.vendorOffer.findFirst({
    where: { vendorId, serviceOfferId: offerId },
  });

  if (existing) {
    throw new Error("You’ve already accepted this offer.");
  }

  const offer = await prisma.serviceOffer.findUnique({
    where: { id: offerId },
    select: {
      clientId: true,
      serviceName: true,
      serviceType: true,
      serviceImage: true,
      status: true,
    },
  });

  if (!offer) throw new Error("Offer not found");
  if (offer.status !== "PENDING") {
    throw new Error("This offer is no longer accepting vendors.");
  }

  const vendor = await prisma.user.findUnique({
    where: { id: vendorId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      vendorOnboarding: true,
      vendorServices: true,
      vendorReviews: true,
      vendorAvailabilities: true,
      products: true,
    },
  });

  if (!vendor) throw new Error("Vendor not found");

  await prisma.vendorOffer.create({
    data: {
      vendorId,
      serviceOfferId: offerId,
    },
  });

  await prisma.notification.create({
    data: {
      userId: offer.clientId,
      type: "OFFER_ACCEPTED",
      message: `${vendor.firstName} ${vendor.lastName} has accepted your service offer: ${offer.serviceName}`,
    },
  });

  return {
    message: "Offer accepted successfully",
    vendorDetails: vendor,
    offerDetails: offer,
  };
};



// export const selectVendorForOffer  = async (
//   offerId: string,
//   selectedVendorId: string,
//   reference: string,
//   paymentMethod: string
// ) => {
//   try {
//     // 1. Update offer with selection and payment info
//     await prisma.serviceOffer.update({
//       where: { id: offerId },
//       data: {
//         status: "SELECTED",
//         reference,
//         paymentMethod,
//       },
//     });

//     // 2. Reset all vendorOffer.isAccepted to false
//     await prisma.vendorOffer.updateMany({
//       where: { serviceOfferId: offerId },
//       data: { isAccepted: false },
//     });

//     // 3. Mark selected vendor's offer as accepted
//     await prisma.vendorOffer.updateMany({
//       where: {
//         serviceOfferId: offerId,
//         vendorId: selectedVendorId,
//       },
//       data: { isAccepted: true },
//     });

//     // 4. Fetch full offer
//     const offer = await prisma.serviceOffer.findUnique({
//       where: { id: offerId },
//     });

//     if (!offer) throw new Error("Offer not found");

//     const {
//       clientId,
//       serviceType,
//       offerAmount,
//       totalAmount,
//       serviceName,
//       date,
//       time,
//       referencePhoto,
//       specialInstruction,
//       serviceImage,
//       homeLocation,
//       fullAddress,
//       landMark,
//     } = offer;

//     if (!reference) throw new Error("Missing payment reference");

//     const finalPaymentMethod = paymentMethod || "CASH";

//     // 5. Create service-offer-based booking (no serviceId involved)
//   await serviceOfferBookingService.createOfferBooking({
//   clientId,
//   vendorId: selectedVendorId,
//   offerId,
//   serviceOfferId, // <-- Make sure you have this value
//   price,          // <-- And this too
//   paymentMethod,
//   serviceName,
//   serviceType,
//   offerAmount,
//   totalAmount,
//   date,
//   time,
//   reference,
//   serviceImage,
//   locationDetails,
// });


//     // 6. Notify vendor
//     await prisma.notification.create({
//       data: {
//         userId: selectedVendorId,
//         type: "VENDOR_SELECTED",
//         message: `You’ve been selected for the service: ${serviceName}`,
//       },
//     });

//     return {
//       success: true,
//       message: "Vendor selected and service offer booking created successfully.",
//     };
//   } catch (error: unknown) {
//     console.error("❌ Error in selectVendorForOffer:", error);
//     return {
//       success: false,
//       message:
//         error instanceof Error ? error.message : "Error selecting vendor",
//     };
//   }
// };






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

export const getClientOffers = async (clientId: string) => {
  return await prisma.serviceOffer.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    include: {
      vendorOffers: {
        include: {
          vendor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              vendorOnboarding: {
                select: {
                  businessName: true,
                  latitude: true,
                  longitude: true,
                },
              },
              vendorAvailabilities: {
                select: {
                  days: true,
                  fromTime: true,
                  toTime: true,
                },
              },
              vendorReviews: {
                where: {
                  OR: [
                    { type: 'VENDOR' },
                    { type: 'SERVICE' },
                  ],
                },
                select: {
                  type: true,
                  rating: true,
                  comment: true,
                  createdAt: true,
                  service: {
                    select: {
                      serviceName: true,
                    },
                  },
                  client: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};


export const addTipToOffer = async (clientId: string, offerId: string, tipAmount: number) => {
  const offer = await prisma.serviceOffer.findUnique({
    where: { id: offerId },
  });

  if (!offer) throw new Error("Offer not found");
  if (offer.clientId !== clientId) throw new Error("Unauthorized action");

  const newAmount = Number(offer.offerAmount) + Number(tipAmount);

  return await prisma.serviceOffer.update({
    where: { id: offerId },
    data: { offerAmount: newAmount },
  });
};
