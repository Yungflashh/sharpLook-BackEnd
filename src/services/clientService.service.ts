import prisma from "../config/prisma"



export const getAllVendorServices = async () => {
  try {
    const services = await prisma.vendorService.findMany({
      include: {
        vendor: {
          include: {
            vendorOnboarding: true, // 👈 include vendor onboarding info
          },
        },
      },
    });
    return services;
  } catch (error) {
    console.error('Failed to fetch all services:', error);
    throw error;
  }
};



export const getVendorServicesByVendorId = async (userId: string) => {
  return await prisma.vendorService.findMany({
    where: { userId },
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
