import prisma from "../config/prisma"
import { ReviewType } from "@prisma/client";  
import { ApprovalStatus } from '@prisma/client';



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
  vendorId: string;
  clientId: string;
  rating: number;
  comment?: string;
  bookingId?: string;
  productId?: string;
  serviceId?: string;
  type: 'BOOKING' | 'PRODUCT' | 'SERVICE';
}) => {
  return await prisma.review.create({
    data: {
      vendor: { connect: { id: vendorId } },
      client: { connect: { id: clientId } },
      rating,
      comment,
      type,
      booking: bookingId ? { connect: { id: bookingId } } : undefined,
    product: { connect: { id: productId } },
      service: serviceId ? { connect: { id: serviceId } } : undefined,
    }
  });
};



export const getVendorReviews = async (vendorId: string, type?: string) => {
  if (!vendorId) throw new Error("vendorId is required");

  const enumValues = Object.values(ReviewType);
  const isValidType = type && enumValues.includes(type as ReviewType);
  const enumType = isValidType ? (type as ReviewType) : undefined;

  return await prisma.review.findMany({
    where: {
      vendorId,
      ...(enumType ? { type: enumType } : {}),
      product: {
        approvalStatus: ApprovalStatus.APPROVED,
      },
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
          approvalStatus: true, // optional: see the status
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
      product: {
        approvalStatus: ApprovalStatus.APPROVED,
      },
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
          approvalStatus: true, // optional to see
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};


