import prisma from "../config/prisma"

export const addToWishlist = async (userId: string, productId: string) => {
  return await prisma.wishlistItem.create({
    data: { userId, productId },
    include: { product: true },
  })
}

export const getUserWishlist = async (userId: string) => {
  return await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: true },
  })
}

export const removeFromWishlist = async (userId: string, productId: string) => {
  return await prisma.wishlistItem.deleteMany({
    where: { userId, productId },
  })
}
