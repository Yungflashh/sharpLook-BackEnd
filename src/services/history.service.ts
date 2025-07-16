import prisma from "../config/prisma"
import { Role, BookingStatus } from "@prisma/client"

export const getPastBookings = async (userId: string, role: Role) => {
  return await prisma.booking.findMany({
    where: {
      [role === "CLIENT" ? "clientId" : "vendorId"]: userId,
      status: BookingStatus.COMPLETED,
    },
    orderBy: { date: "asc" }
  })
}

export const getUpcomingBookings = async (userId: string, role: Role) => {
  return await prisma.booking.findMany({
    where: {
      [role === "CLIENT" ? "clientId" : "vendorId"]: userId,
      status: { in: [BookingStatus.PENDING, BookingStatus.ACCEPTED] },
    },
   orderBy: { date: "asc" }
  })
}
