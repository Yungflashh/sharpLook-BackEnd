// src/services/booking.service.ts
import prisma from "../config/prisma"
import { BookingStatus, Prisma } from "@prisma/client"

export const createBooking = async (
  clientId: string,
  vendorId: string,
  date: Date,
  time: string
) => {
  try {
    return await prisma.booking.create({
      data: {
        clientId,
        vendorId,
        date,
        time,
        status: BookingStatus.PENDING,
      },
    })
  } catch (error: any) {
    throw new Error("Failed to create booking: " + error.message)
  }
}

export const getBookingsByUser = async (
  userId: string,
  role: "CLIENT" | "VENDOR",
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit
  try {
    const whereClause = role === "CLIENT" ? { clientId: userId } : { vendorId: userId }
    const includeClause = role === "CLIENT" ? { vendor: true } : { client: true }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: includeClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count({ where: whereClause }),
    ])

    return {
      bookings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error: any) {
    throw new Error("Failed to fetch bookings: " + error.message)
  }
}

export const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
  try {
    return await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    })
  } catch (error: any) {
    throw new Error("Failed to update booking status: " + error.message)
  }
}
