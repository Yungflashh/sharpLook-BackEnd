import prisma from "../config/prisma"
import { BookingStatus , PaymentStatus, Booking } from "@prisma/client"
import { debitWallet, getUserWallet, creditWallet } from "./wallet.service"

export const createBooking = async (
  clientId: string,
  vendorId: string,
  serviceId: string,
  paymentMethod: string,
  serviceName: string,
  price: number,
  totalAmount: number,
  time: string,
  date: string
) => {
  if (paymentMethod === "SHARP-PAY") {
    const wallet = await getUserWallet(clientId);
    if (!wallet || wallet.balance < price) {
      throw new Error("Insufficient wallet balance");
    }

    // Debit client wallet and create transaction
    await debitWallet(wallet.id, price, "Booking Payment");

    // Booking paymentStatus = LOCKED when wallet money is deducted but not yet paid out
    return await prisma.booking.create({
      data: {
        clientId,
        vendorId,
        serviceId,
        totalAmount,
        paymentMethod,
        paymentStatus: PaymentStatus.LOCKED,
        serviceName,
        date,
        time,
        price,
        status: BookingStatus.PENDING,
      }
    });
  }

  // For other payment methods (CARD, etc), just create booking as usual with PENDING paymentStatus
  return await prisma.booking.create({
    data: {
      clientId,
      vendorId,
      serviceId,
      totalAmount,
      paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      serviceName,
      date,
      time,
      price,
      status: BookingStatus.PENDING,
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
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");

  if (status === BookingStatus.REJECTED && booking.paymentStatus === PaymentStatus.LOCKED) {
    // Refund client wallet if booking rejected and payment was locked
    const wallet = await getUserWallet(booking.clientId);
    if (!wallet) throw new Error("Client wallet not found");
    await creditWallet(wallet.id, booking.price, "Booking Refund");

    // Update booking paymentStatus and status
    return prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.REJECTED,
        paymentStatus: PaymentStatus.REFUNDED,
      },
    });
  }

  if (status === BookingStatus.ACCEPTED) {
    // Vendor accepts booking, just update status but keep payment locked
    return prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.ACCEPTED },
    });
  }

  // For other statuses just update normally
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
}
export const getBookingById = async (bookingId: string) => {
  return await prisma.booking.findUnique({
    where: { id: bookingId },
  })
}

export const markBookingCompletedByClient = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { clientCompleted: true },
  });

  // If vendor also completed, finalize payment
  if (updated.vendorCompleted) {
    await finalizeBookingPayment(updated);
  }

  return updated;
};

export const markBookingCompletedByVendor = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { vendorCompleted: true },
  });

  // If client also completed, finalize payment
  if (updated.clientCompleted) {
    await finalizeBookingPayment(updated);
  }

  return updated;
};

const finalizeBookingPayment = async (booking: Booking): Promise<Booking> => {
  if (booking.paymentStatus !== PaymentStatus.LOCKED) {
    throw new Error("Booking payment is not locked or already finalized");
  }

  const vendorWallet = await getUserWallet(booking.vendorId);
  if (!vendorWallet) throw new Error("Vendor wallet not found");
  await creditWallet(vendorWallet.id, booking.price, "Booking Payment Received");

  return await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: PaymentStatus.COMPLETED,
      status: BookingStatus.COMPLETED,
    },
  });
};

