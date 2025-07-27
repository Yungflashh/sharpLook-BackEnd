import  prisma  from "../config/prisma"
import { uploadBufferToCloudinary } from "../utils/cloudinary";
import { EditableUserFields } from "../types/user.types"


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
      vendorAvailabilities: true,
      promotions: true,
      wallet: true,
      products: true, 
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

      return {
        ...vendor,
        rating: avgRating,
        totalReviews: total,
        products: vendor.products // ✅ Ensure products are explicitly returned
      };
    })
    .sort((a: any, b: any) => b.rating - a.rating)
    .slice(0, limit);

  return sorted;
};



export const getVendorDetails = async (vendorId: string) => {
  const vendor = await prisma.user.findUnique({
    where: {
      id: vendorId
    },
    include: {
      vendorOnboarding: true,
      vendorAvailabilities: true,
      vendorServices: true,
      vendorReviews: {
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      promotions: {
        where: {
          isActive: true
        },
        orderBy: {
          startDate: "desc"
        }
      },
      products: true, // Include full product info, not just selected fields
      wallet: true,
      cartItems: true,
      wishlistItems: true,
      orders: true,
      referralsMade: true,
      referralsGotten: true,
      notifications: true,
      sentMessages: true,
      receivedMessages: true,
    }
  });

  if (!vendor) return null;

  // Optional: Compute average rating & total reviews
  const reviews = vendor.vendorReviews || [];
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / totalReviews
      : 0;

  return {
    ...vendor,
    totalReviews,
    avgRating
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