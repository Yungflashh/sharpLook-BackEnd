import prisma from "../config/prisma"

export const addToCart = async (userId: string, productId: string) => {
  return await prisma.cartItem.create({
    data: { userId, productId },
    include: { product: true },
  })
}

export const getUserCart = async (userId: string) => {
  return await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  })
}

export const removeFromCart = async (userId: string, productId: string) => {
  return await prisma.cartItem.deleteMany({
    where: { userId, productId },
  })
}
