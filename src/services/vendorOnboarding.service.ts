// src/services/vendorOnboarding.service.ts
import prisma from "../config/prisma"
import { Prisma, ServiceType } from "@prisma/client"

export const createVendorOnboarding = async (
  userId: string,
  serviceType: ServiceType,
  identityImageUrl: string, // Cloudinary secure_url
 
) => {
  return await prisma.vendorOnboarding.create({
    data: {
      userId,
      serviceType,
      identityImage: identityImageUrl, // Maps to your schema's identityImage
     
    },
  })
}

export const getVendorOnboarding = async (userId: string) => {
  return await prisma.vendorOnboarding.findUnique({
    where: { userId },
  })
}




export const updateVendorProfile = async (
  vendorId: string,
  {
    bio,
    location,
    servicesOffered,
    portfolioImages,
    availability,
    ...rest
  }: {
    bio?: string;
    location?: string;
    servicesOffered?: string[];
    portfolioImages?: string[];
    availability?: {
      days: string[];
      fromTime: string;
      toTime: string;
    };
    [key: string]: any;
  }
) => {
  // 🔧 Update VendorOnboarding first
  const updatedProfile = await prisma.vendorOnboarding.update({
    where: { userId: vendorId },
    data: {
      bio,
      location,
      servicesOffered,
      portfolioImages,
      ...rest,
    },
  });

  // 🗓️ Optional: Update availability if provided
  let availabilityRecord = null;
  if (availability) {
    availabilityRecord = await prisma.vendorAvailability.upsert({
      where: { vendorId },
      update: {
        days: availability.days,
        fromTime: availability.fromTime,
        toTime: availability.toTime,
      },
      create: {
        vendorId,
        days: availability.days,
        fromTime: availability.fromTime,
        toTime: availability.toTime,
      },
    });
  }

  return {
    onboarding: updatedProfile,
    availability: availabilityRecord,
  };
};



