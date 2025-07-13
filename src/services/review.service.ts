import prisma from "../config/prisma"

export const createReview = async (
  vendorId: string,
  clientId: string,
  bookingId: string,
  rating: number,
  comment?: string
) => {
  return await prisma.review.create({
    data: {
      vendorId,
      clientId,
      bookingId,
      rating,
      comment,
    },
  })
}

export const getVendorReviews = async (vendorId: string) => {
  return await prisma.review.findMany({
    where: { vendorId },
    include: { client: true, booking: true },
  })
}
