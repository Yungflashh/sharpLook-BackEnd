import prisma from "../config/prisma"

export const addPortfolioImages = async (userId: string, imageUrls: string[]) => {
  return await prisma.vendorOnboarding.update({
    where: { userId },
    data: {
      portfolioImages: { push: imageUrls },
    },
  })
}


export const getPortfolioImages = async (userId: string) => {
  return await prisma.vendorOnboarding.findUnique({
    where: { userId },
    select: { portfolioImages: true },
  })
}

export const updateVendorSpecialties = async (userId: string, specialties: string[]) => {
  return await prisma.vendorOnboarding.update({
    where: { userId },
    data: { specialties },
  })
}

export const getVendorSpecialties = async (userId: string) => {
  return await prisma.vendorOnboarding.findUnique({
    where: { userId },
    select: { specialties: true },
  })

}


export const setVendorAvailability = async (
  vendorId: string,
  days: string[],
  fromTime: string,
  toTime: string
) => {
  return await prisma.vendorAvailability.upsert({
    where: { vendorId },
    update: { days, fromTime, toTime },
    create: { vendorId, days, fromTime, toTime },
  })
}

export const getVendorAvailability = async (vendorId: string) => {
  return await prisma.vendorAvailability.findUnique({ where: { vendorId } })
}