import  prisma  from "../config/prisma"
import { uploadBufferToCloudinary } from "../utils/cloudinary";
import { EditableUserFields } from "../types/user.types"
import { ApprovalStatus } from '@prisma/client';


export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({ where: { id } })
}

export const updateUserProfile = async (id: string, data: EditableUserFields) => {
  return await prisma.user.update({
    where: { id },
    data
  });
};




export const updateClientLocationPreferences = async (
  userId: string,
  latitude: number,
  longitude: number,
  radiusKm: number
) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      preferredLatitude: latitude,
      preferredLongitude: longitude,
      preferredRadiusKm: radiusKm,
    },
  });
};



export const getTopRatedVendors = async (limit: number = 10) => {
  const topVendors = await prisma.user.findMany({
    where: { role: "VENDOR" },
    include: {
      vendorOnboarding: true,
      vendorReviews: true,
      vendorServices: true,
      vendorAvailability: true,
      promotions: true,
      wallet: true,
      products: true,  // fetch all products, then filter
    },
  });

  const sorted = topVendors
    .map((vendor: any) => {
      const reviews = vendor.vendorReviews || [];
      const total = reviews.length;
      const avgRating =
        total > 0
          ? reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / total
          : 0;

      // Filter approved products only
      const approvedProducts = (vendor.products || []).filter(
        (product: any) => product.approvalStatus === ApprovalStatus.APPROVED
      );

      return {
        ...vendor,
        rating: avgRating,
        totalReviews: total,
        products: approvedProducts,
      };
    })
    .sort((a: any, b: any) => b.rating - a.rating)
    .slice(0, limit);

  return sorted;
};




export const getVendorDetails = async (vendorId: string) => {
  const vendor = await prisma.user.findUnique({
    where: {
      id: vendorId,
    },
    include: {
      vendorOnboarding: true,
      vendorAvailability: true,
      vendorServices: true,
      vendorReviews: {
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      promotions: {
        where: {
          isActive: true,
        },
        orderBy: {
          startDate: 'desc',
        },
      },
      products: true, // fetch all products, filter below
      wallet: true,
      cartItems: true,
      wishlistItems: true,
      orders: true,
      referralsMade: true,
      referralsGotten: true,
      notifications: true,
      sentMessages: true,
      receivedMessages: true,
    },
  });

  if (!vendor) return null;

  // Filter only approved products
  const approvedProducts = (vendor.products || []).filter(
    (product: any) => product.approvalStatus === ApprovalStatus.APPROVED
  );

  // Compute average rating & total reviews
  const reviews = vendor.vendorReviews || [];
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / totalReviews
      : 0;

  return {
    ...vendor,
    products: approvedProducts,
    totalReviews,
    avgRating,
  };
};





export const updateUserAvatar = async (userId: string, fileBuffer: Buffer) => {
  const cloudinaryResult = await uploadBufferToCloudinary(fileBuffer, "avatars");

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: cloudinaryResult.secure_url },
  });

  return user.avatar;
};


export const deleteUserAccount = async (userId: string) => {
  // Ensure the user exists
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    throw new Error("User not found.");
  }

  // Delete related entities if required (cascading logic can vary based on your needs)

  // Example: Delete VendorOnboarding if exists
  await prisma.vendorOnboarding.deleteMany({
    where: { userId },
  });

  // You may want to soft delete instead (e.g., mark `isBanned = true` or `deletedAt = Date`)
  await prisma.user.delete({ where: { id: userId } });

  return { success: true, message: "Account deleted successfully." };
};
