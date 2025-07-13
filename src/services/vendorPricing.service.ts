// src/services/vendorPricing.service.ts
import prisma from "../config/prisma"

export const updateVendorPricing = async (userId: string, pricing: any) => {
  return await prisma.vendorOnboarding.update({
    where: { userId },
    data: { pricing },
  })
}

export const getVendorPricing = async (userId: string) => {
  const vendor = await prisma.vendorOnboarding.findUnique({
    where: { userId },
    select: { pricing: true },
  })
  return vendor?.pricing
}
