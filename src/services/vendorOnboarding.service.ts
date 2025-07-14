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
  userId: string,
  data: Prisma.VendorOnboardingUpdateInput
) => {
  return await prisma.vendorOnboarding.update({
    where: { userId },
    data,
  })
}


