import prisma from "../config/prisma"

export const calculateEarnings = async (vendorId: string) => {
  const now = new Date()

  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [daily, weekly, monthly] = await Promise.all([
    prisma.booking.aggregate({
      _sum: { price: true },
      where: {
        vendorId,
        status: "COMPLETED",
        createdAt: { gte: startOfDay },
      },
    }),
    prisma.booking.aggregate({
      _sum: { price: true },
      where: {
        vendorId,
        status: "COMPLETED",
        createdAt: { gte: startOfWeek },
      },
    }),
    prisma.booking.aggregate({
      _sum: { price: true },
      where: {
        vendorId,
        status: "COMPLETED",
        createdAt: { gte: startOfMonth },
      },
    }),
  ])

  return {
    dailyEarnings: daily._sum.price || 0,
    weeklyEarnings: weekly._sum.price || 0,
    monthlyEarnings: monthly._sum.price || 0,
  }
}
