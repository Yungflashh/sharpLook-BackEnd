import prisma from "../config/prisma"
import { ReviewType } from "@prisma/client";  



export const createReview = async ({
  vendorId,
  clientId,
  rating,
  comment,
  bookingId,
  productId,
  serviceId,
  type
}: {
  vendorId: string
  clientId: string
  rating: number
  comment?: string
  bookingId?: string
  productId?: string
  serviceId?: string
  type: 'BOOKING' | 'PRODUCT' | 'SERVICE'
}) => {
  return await prisma.review.create({
    data: {
      vendorId,
      clientId,
      rating,
      comment,
      bookingId,
      productId,
      serviceId,
      type
    }
  });
};


// export const getVendorReviews = async (vendorId: string) => {
//   return await prisma.review.findMany({
//     where: { vendorId },
//     include: {
//       client: {
//         select: {
//           firstName: true,
//           lastName: true,
//           avatar: true,
//         },
//       },
//       booking: {
//         select: {
//           id: true,
//           date: true,
//           serviceName: true,
//         },
//       },
//       product: {
//         select: {
//           id: true,
//           productName: true,
//           picture: true,
//         },
//       },
//       service: {
//         select: {
//           id: true,
//           serviceName: true,
//           serviceImage: true,
//         },
//       },
//     },
//     orderBy: {
//       createdAt: 'desc',
//     },
//   });
// };


export const getVendorReviews = async (vendorId: string, type?: string) => {
  if (!vendorId) throw new Error("vendorId is required");

  // Only set enumType if it's a valid ReviewType value
  const enumValues = Object.values(ReviewType);
  const isValidType = type && enumValues.includes(type as ReviewType);

  const enumType = isValidType ? (type as ReviewType) : undefined;

  return await prisma.review.findMany({
    where: {
      vendorId,
      ...(enumType ? { type: enumType } : {}),
    },
    include: {
      client: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      booking: {
        select: {
          id: true,
          date: true,
          serviceName: true,
        },
      },
      product: {
        select: {
          id: true,
          productName: true,
          picture: true,
        },
      },
      service: {
        select: {
          id: true,
          serviceName: true,
          serviceImage: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getServiceReviewsByVendor = async (vendorId: string, serviceId: string) => {
  return await prisma.review.findMany({
    where: {
      vendorId,
      serviceId,
    },
    include: {
      client: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      service: {
        select: {
          id: true,
          serviceName: true,
          serviceImage: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};



export const getProductReviewsByVendor = async (vendorId: string, productId: string) => {
  return await prisma.review.findMany({
    where: {
      vendorId,
      productId,
    },
    include: {
      client: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      product: {
        select: {
          id: true,
          productName: true,
          picture: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};
