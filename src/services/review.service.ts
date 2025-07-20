import prisma from "../config/prisma"
import { ReviewType } from "@prisma/client";  // <-- add this line



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


export const getVendorReviews = async (vendorId: string, type?: ReviewType) => {
  return await prisma.review.findMany({
    where: {
      vendorId,
      ...(type ? { type } : {}), // Optional filter
    },
    include: {
      client: { select: { firstName: true, lastName: true, avatar: true } },
      booking: { select: { id: true, date: true, serviceName: true } },
      product: { select: { id: true, productName: true, picture: true } },
      service: { select: { id: true, serviceName: true, serviceImage: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};
