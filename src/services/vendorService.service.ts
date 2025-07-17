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


// ✅ Get all services (admin/global purpose)
export const getAllServices = async () => {
  return await prisma.vendorService.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vendor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
};

// ✅ Edit (update) a vendor service
export const editVendorService = async (
  serviceId: string,
  updateData: {
    serviceName?: string;
    servicePrice?: number;
    serviceImage?: string;
  }
) => {
  return await prisma.vendorService.update({
    where: { id: serviceId },
    data: updateData,
  });
};

// ✅ Delete a vendor service
export const deleteVendorService = async (serviceId: string) => {
  return await prisma.vendorService.delete({
    where: { id: serviceId },
  });
};


