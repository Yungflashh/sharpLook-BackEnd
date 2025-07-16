import prisma from "../config/prisma"

export const getAllVendorServices = async () => {
  return await prisma.vendorService.findMany({
    include: {
      vendor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          vendorOnboarding: true,
        },
      },
    },
  })
}

export const getVendorServicesByVendorId = async (vendorId: string) => {
  return await prisma.vendorService.findMany({
    where: { vendorId },
    include: {
      vendor: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true,
          vendorOnboarding: true,
        },
      },
    },
  })
}
