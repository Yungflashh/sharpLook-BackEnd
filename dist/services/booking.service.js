"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markBookingCompletedByVendor = exports.markBookingCompletedByClient = exports.getBookingById = exports.updateBookingStatus = exports.getUserBookings = exports.createBooking = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const wallet_service_1 = require("./wallet.service");
const createBooking = async (clientId, vendorId, serviceId, paymentMethod, serviceName, price, totalAmount, time, date) => {
    if (paymentMethod === "SHARP-PAY") {
        const wallet = await (0, wallet_service_1.getUserWallet)(clientId);
        if (!wallet || wallet.balance < price) {
            throw new Error("Insufficient wallet balance");
        }
        // Debit client wallet and create transaction
        await (0, wallet_service_1.debitWallet)(wallet.id, price, "Booking Payment");
        // Booking paymentStatus = LOCKED when wallet money is deducted but not yet paid out
        return await prisma_1.default.booking.create({
            data: {
                clientId,
                vendorId,
                serviceId,
                totalAmount,
                paymentMethod,
                paymentStatus: client_1.PaymentStatus.LOCKED,
                serviceName,
                date,
                time,
                price,
                status: client_1.BookingStatus.PENDING,
            }
        });
    }
    // For other payment methods (CARD, etc), just create booking as usual with PENDING paymentStatus
    return await prisma_1.default.booking.create({
        data: {
            clientId,
            vendorId,
            serviceId,
            totalAmount,
            paymentMethod,
            paymentStatus: client_1.PaymentStatus.PENDING,
            serviceName,
            date,
            time,
            price,
            status: client_1.BookingStatus.PENDING,
        }
    });
};
exports.createBooking = createBooking;
// export const createBooking = async (
//   clientId: string,
//   vendorId: string,
//   serviceId: string,
//   paymentMethod: string,
//   serviceName: string,
//   servicePrice: number,
//   date: string,
//   time: string,
//   isHomeService: boolean,
//   distanceKm?: number,
//   serviceLocation?: string,
//   landmark?: string,
//   instructions?: string,
//   referencePhoto?: string
// ) => {
//   const homeServicePrice = isHomeService ? calculateHomeServicePrice(distanceKm || 0) : 0;
//   const totalAmount = servicePrice + homeServicePrice;
//   if (paymentMethod === "SHARP-PAY") {
//     const wallet = await getUserWallet(clientId);
//     if (!wallet || wallet.balance < totalAmount) {
//       throw new Error("Insufficient wallet balance");
//     }
//     // 💰 Debit wallet immediately
//     await debitWallet(wallet.id, totalAmount, "Home Service Booking Payment");
//   }
//   // Create booking
//   return await prisma.booking.create({
//     data: {
//       clientId,
//       vendorId,
//       serviceId,
//       paymentMethod,
//       paymentStatus: paymentMethod === "SHARP-PAY" ? PaymentStatus.LOCKED : PaymentStatus.PENDING,
//       serviceName,
//       date,
//       time,
//       price: servicePrice,
//       homeServicePrice,
//       totalAmount,
//       status: BookingStatus.PENDING,
//       serviceLocation,
//       landmark,
//       instructions,
//       referencePhoto,
//     }
//   });
// };
// const calculateHomeServicePrice = (distanceKm: number): number => {
//   const baseRatePerKm = 1000; // ₦1000 per km
//   return Math.ceil(distanceKm) * baseRatePerKm;
// };
const getUserBookings = async (userId, role) => {
    const condition = role === "CLIENT" ? { clientId: userId } : { vendorId: userId };
    const include = role === "CLIENT" ? { vendor: true } : { client: true };
    return await prisma_1.default.booking.findMany({
        where: condition,
        include,
        orderBy: { createdAt: "desc" },
    });
};
exports.getUserBookings = getUserBookings;
const updateBookingStatus = async (bookingId, status) => {
    const booking = await prisma_1.default.booking.findUnique({ where: { id: bookingId } });
    if (!booking)
        throw new Error("Booking not found");
    if (status === client_1.BookingStatus.REJECTED && booking.paymentStatus === client_1.PaymentStatus.LOCKED) {
        // Refund client wallet if booking rejected and payment was locked
        const wallet = await (0, wallet_service_1.getUserWallet)(booking.clientId);
        if (!wallet)
            throw new Error("Client wallet not found");
        await (0, wallet_service_1.creditWallet)(wallet.id, booking.price, "Booking Refund");
        // Update booking paymentStatus and status
        return prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                status: client_1.BookingStatus.REJECTED,
                paymentStatus: client_1.PaymentStatus.REFUNDED,
            },
        });
    }
    if (status === client_1.BookingStatus.ACCEPTED) {
        // Vendor accepts booking, just update status but keep payment locked
        return prisma_1.default.booking.update({
            where: { id: bookingId },
            data: { status: client_1.BookingStatus.ACCEPTED },
        });
    }
    // For other statuses just update normally
    return prisma_1.default.booking.update({
        where: { id: bookingId },
        data: { status },
    });
};
exports.updateBookingStatus = updateBookingStatus;
const getBookingById = async (bookingId) => {
    return await prisma_1.default.booking.findUnique({
        where: { id: bookingId },
    });
};
exports.getBookingById = getBookingById;
const markBookingCompletedByClient = async (bookingId) => {
    const booking = await prisma_1.default.booking.findUnique({ where: { id: bookingId } });
    if (!booking)
        throw new Error("Booking not found");
    const updated = await prisma_1.default.booking.update({
        where: { id: bookingId },
        data: { clientCompleted: true },
    });
    // If vendor also completed, finalize payment
    if (updated.vendorCompleted) {
        await finalizeBookingPayment(updated);
    }
    return updated;
};
exports.markBookingCompletedByClient = markBookingCompletedByClient;
const markBookingCompletedByVendor = async (bookingId) => {
    const booking = await prisma_1.default.booking.findUnique({ where: { id: bookingId } });
    if (!booking)
        throw new Error("Booking not found");
    const updated = await prisma_1.default.booking.update({
        where: { id: bookingId },
        data: { vendorCompleted: true },
    });
    // If client also completed, finalize payment
    if (updated.clientCompleted) {
        await finalizeBookingPayment(updated);
    }
    return updated;
};
exports.markBookingCompletedByVendor = markBookingCompletedByVendor;
const finalizeBookingPayment = async (booking) => {
    if (booking.paymentStatus !== client_1.PaymentStatus.LOCKED) {
        throw new Error("Booking payment is not locked or already finalized");
    }
    const vendorWallet = await (0, wallet_service_1.getUserWallet)(booking.vendorId);
    if (!vendorWallet)
        throw new Error("Vendor wallet not found");
    await (0, wallet_service_1.creditWallet)(vendorWallet.id, booking.price, "Booking Payment Received");
    return await prisma_1.default.booking.update({
        where: { id: booking.id },
        data: {
            paymentStatus: client_1.PaymentStatus.COMPLETED,
            status: client_1.BookingStatus.COMPLETED,
        },
    });
};
