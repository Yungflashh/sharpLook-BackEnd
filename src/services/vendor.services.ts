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