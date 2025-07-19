import prisma from "../config/prisma"



export const getAllVendorServices = async () => {
   try {
    // No 'where' clause here — fetch all vendor services
    const services = await prisma.vendorService.findMany({
      include: { vendor: true }  // optional: include vendor info
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
