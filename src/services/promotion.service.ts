// src/services/promotion.service.ts
import prisma from "../config/prisma"

export const createPromotion = async (
  vendorId: string,
  title: string,
  description: string,
  discountPercentage: number,
  startDate: Date,
  endDate: Date
) => {
  return await prisma.promotion.create({
    data: {
      vendorId,
      title,
      description,
      discountPercentage,
      startDate,
      endDate,
    },
  })
}

export const getVendorPromotions = async (vendorId: string) => {
  return await prisma.promotion.findMany({
    where: { vendorId },
    orderBy: { createdAt: "desc" },
  })
}

export const getActivePromotions = async () => {
  const now = new Date()
  return await prisma.promotion.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: { vendor: true },
  })
}

export const togglePromotionStatus = async (promotionId: string, isActive: boolean) => {
  return await prisma.promotion.update({
    where: { id: promotionId },
    data: { isActive },
  })
}
