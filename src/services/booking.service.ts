import prisma from "../config/prisma"
import { BookingStatus } from "@prisma/client"
import { debitWallet, getUserWallet } from "./wallet.service"

export const createBooking = async (
  clientId: string,
  vendorId: string,
  serviceId: string,
  amount: number,
  paymentMethod: "SHARPPAY" | "CARD",
  serviceName: string,
  price : number,
  paymentStatus : string,
  totalAmount: number,
  time: string,
  date: string

) => {
  if (paymentMethod === "SHARPPAY") {
    const wallet = await getUserWallet(clientId);
    if (!wallet || wallet.balance < amount) {
      throw new Error("Insufficient wallet balance");
    }

    await debitWallet(wallet.id, amount, "Booking Payment");
  }

  return await prisma.booking.create({
  data: {
    clientId,
    vendorId,
    serviceId,
    totalAmount,
    paymentMethod, // "WALLET" | "CARD"
    paymentStatus, // e.g. "PENDING"
    serviceName,
    date,          // e.g. new Date().toISOString().split("T")[0]
    time,          // e.g. "12:00 PM"
    price,         // probably the same as totalAmount or service price
    status: "PENDING", // or "CONFIRMED", depending on logic
  }
});

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