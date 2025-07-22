import prisma from "../config/prisma";
import { BookingStatus, PaymentStatus, Booking } from "@prisma/client";
import { debitWallet, getUserWallet, creditWallet } from "./wallet.service";

export const createBooking = async (
  clientId: string,
  vendorId: string,
  serviceId: string,
  paymentMethod: string,
  serviceName: string,
  price: number,
  totalAmount: number,
  time: string,
  date: string,
  reference: string // <-- reference passed in here
) => {
  if (paymentMethod === "SHARP-PAY") {
    const wallet = await getUserWallet(clientId);
    if (!wallet || wallet.balance < price) {
      throw new Error("Insufficient wallet balance");
    }

    // Pass the reference from the function param here
    await debitWallet(wallet.id, price, "Booking Payment", reference);

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
      },
    });
  }

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
    },
  });
};

export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus,
  refundReference?: string // <-- optional reference for refund
) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");

  if (status === BookingStatus.REJECTED && booking.paymentStatus === PaymentStatus.LOCKED) {
    const wallet = await getUserWallet(booking.clientId);
    if (!wallet) throw new Error("Client wallet not found");

    if (!refundReference) throw new Error("Refund reference required");

    await creditWallet(wallet.id, booking.price, "Booking Refund", refundReference);

    return prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.REJECTED,
        paymentStatus: PaymentStatus.REFUNDED,
      },
    });
  }

  if (status === BookingStatus.ACCEPTED) {
    return prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.ACCEPTED },
    });
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
};

export const markBookingCompletedByClient = async (
  bookingId: string,
  creditReference: string 
) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { clientCompleted: true },
  });

  if (updated.vendorCompleted) {
    await finalizeBookingPayment(updated, creditReference);
  }

  return updated;
};

export const markBookingCompletedByVendor = async (
  bookingId: string,
  creditReference: string // reference to pass on final credit
) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { vendorCompleted: true },
  });

  if (updated.clientCompleted) {
    await finalizeBookingPayment(updated, creditReference);
  }

  return updated;
};

const finalizeBookingPayment = async (
  booking: Booking,
  reference: string
): Promise<Booking> => {
  if (booking.paymentStatus !== PaymentStatus.LOCKED) {
    throw new Error("Booking payment is not locked or already finalized");
  }

  const vendorWallet = await getUserWallet(booking.vendorId);
  if (!vendorWallet) throw new Error("Vendor wallet not found");

  await creditWallet(vendorWallet.id, booking.price, "Booking Payment Received", reference);

  return await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: PaymentStatus.COMPLETED,
      status: BookingStatus.COMPLETED,
    },
  });
};

export const getBookingById = async (bookingId: string) => {
  return await prisma.booking.findUnique({
    where: { id: bookingId },
  });
};

export const getUserBookings = async (userId: string, role: "CLIENT" | "VENDOR") => {
  const condition = role === "CLIENT" ? { clientId: userId } : { vendorId: userId };
  const include = role === "CLIENT" ? { vendor: true } : { client: true };

  return await prisma.booking.findMany({
    where: condition,
    include,
    orderBy: { createdAt: "desc" },
  });
};