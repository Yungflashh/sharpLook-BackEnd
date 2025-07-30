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



import uploadToCloudinary from "../utils/cloudinary";

interface Availability {
  days: string[];
  fromTime: string;
  toTime: string;
}

export const updateVendorProfile = async (
  vendorId: string,
  {
    bio,
    location,
    servicesOffered,
    portfolioFiles,
    availability,
    ...rest
  }: {
    bio?: string;
    location?: string;
    servicesOffered?: string[] | string;
    portfolioFiles?: Express.Multer.File[];
    availability?: Availability | string;
    [key: string]: any;
  }
) => {
  // 🧠 Parse incoming data if needed
  const parsedAvailability =
    typeof availability === "string" ? JSON.parse(availability) : availability;

  const parsedServicesOffered =
    typeof servicesOffered === "string"
      ? JSON.parse(servicesOffered)
      : servicesOffered;

  // 🖼️ Upload images to Cloudinary
  let portfolioImages: string[] = [];
  if (portfolioFiles && portfolioFiles.length > 0) {
    for (const file of portfolioFiles) {
      const result = await uploadToCloudinary(file.buffer, file.mimetype);
      portfolioImages.push(result.secure_url);
    }
  }

  // 🔧 Update onboarding info
  const updatedProfile = await prisma.vendorOnboarding.update({
    where: { userId: vendorId },
    data: {
      bio,
      location,
      servicesOffered: parsedServicesOffered,
      portfolioImages,
      ...rest,
    },
  });

  // 🗓️ Upsert availability
  let availabilityRecord = null;
  if (parsedAvailability) {
    availabilityRecord = await prisma.vendorAvailability.upsert({
      where: { vendorId },
      update: {
        days: parsedAvailability.days,
        fromTime: parsedAvailability.fromTime,
        toTime: parsedAvailability.toTime,
      },
      create: {
        vendorId,
        days: parsedAvailability.days,
        fromTime: parsedAvailability.fromTime,
        toTime: parsedAvailability.toTime,
      },
    });
  }

  return {
    onboarding: updatedProfile,
    availability: availabilityRecord,
  };
};



