import prisma from "../config/prisma"
import { BookingStatus } from "@prisma/client"

export const createBooking = async (
  clientId: string,
  vendorId: string,
  date: Date,
  time: string,
  price: number,
  serviceName: string
) => {
  return await prisma.booking.create({
    data: {
      clientId,
      vendorId,
      date,
      time,
      price,
      serviceName,
      status: BookingStatus.PENDING,
    },
  })
}

export const getUserBookings = async (userId: string, role: "CLIENT" | "VENDOR") => {
  const condition = role === "CLIENT" ? { clientId: userId } : { vendorId: userId }
  const include = role === "CLIENT" ? { vendor: true } : { client: true }

  return await prisma.booking.findMany({
    where: condition,
    include,
    orderBy: { createdAt: "desc" },
  })
}

export const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  })
}

export const getBookingById = async (bookingId: string) => {
  return await prisma.booking.findUnique({
    where: { id: bookingId },
  })
}