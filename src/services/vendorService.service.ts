import prisma from "../config/prisma"

export const addVendorService = async (
  vendorId: string,
  serviceName: string,
  servicePrice: number,
  serviceImage: string
) => {
  return await prisma.vendorService.create({
    data: {
      vendorId,
      serviceName,
      servicePrice,
      serviceImage,
    },
  })
}

export const getVendorServices = async (vendorId: string) => {
  return await prisma.vendorService.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
  })
}




