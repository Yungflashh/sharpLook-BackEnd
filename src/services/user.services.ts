import  prisma  from "../config/prisma"

export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({ where: { id } })
}

export const updateUserProfile = async (id: string, data: Partial<any>) => {
  return await prisma.user.update({
    where: { id },
    data
  })
}



export const updateClientLocationPreferences = async (
  userId: string,
  latitude: number,
  longitude: number,
  radiusKm: number
) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      preferredLatitude: latitude,
      preferredLongitude: longitude,
      preferredRadiusKm: radiusKm,
    },
  });
};



export const getTopRatedVendors = async (limit: number = 10) => {
  const topVendors = await prisma.user.findMany({
    where: { role: "VENDOR" },
    include: {
      vendorOnboarding: true,
      vendorReviews: true,

    },
  })

  const sorted = topVendors
    .map((vendor : any) => {
      const reviews = vendor.vendorReviews
      const total = reviews.length
      const avgRating = total > 0
        ? reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / total
        : 0

      return {
        id: vendor.id,
        name: vendor.name,
        avatar: vendor.avatar,
        businessName: vendor.vendorOnboarding?.businessName,
        specialties: vendor.vendorOnboarding?.specialties,
        rating: avgRating,
        totalReviews: total,
      }
    })
    .sort((a:any, b:any) => b.rating - a.rating)
    .slice(0, limit)

  return sorted
}




export const getVendorDetails = async (vendorId: string) => {
  // Fetch vendor onboarding, user, availability, services, reviews
  const vendor = await prisma.user.findUnique({
    where: { id: vendorId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
      phone: true,
      bio: true,
      vendorOnboarding: true,
      vendorAvailabilities: true,
      vendorServices: true,
      vendorReviews: {
        select: {
          rating: true,
          comment: true,
          createdAt: true,
          client: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      promotions: {
        where: { isActive: true },
        orderBy: { startDate: "desc" },
      },
      products: {
        select: {
          productName: true,
          price: true,
          picture: true,
          status: true,
        },
      },
    },
  })
  if (!vendor) return null
  return {
  id: vendor.id,
  name: `${vendor.firstName} ${vendor.lastName}`,
  bio: vendor.bio,
  avatar: vendor.avatar,
  email: vendor.email,
  phone: vendor.phone,
  onboarding: vendor.vendorOnboarding,
  availability: vendor.vendorAvailabilities,
  services: vendor.vendorServices,
  reviews: vendor.vendorReviews,
  promotions: vendor.promotions,
  products: vendor.products,
}

}
