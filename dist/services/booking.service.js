"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBookings = exports.getBookingById = exports.markBookingCompletedByVendor = exports.markBookingCompletedByClient = exports.updateBookingStatus = exports.createBooking = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const wallet_service_1 = require("./wallet.service");
const createBooking = async (clientId, vendorId, serviceId, paymentMethod, serviceName, price, totalAmount, time, date, reference // <-- reference passed in here
) => {
    if (paymentMethod === "SHARP-PAY") {
        const wallet = await (0, wallet_service_1.getUserWallet)(clientId);
        if (!wallet || wallet.balance < price) {
            throw new Error("Insufficient wallet balance");
        }
        // Pass the reference from the function param here
        await (0, wallet_service_1.debitWallet)(wallet.id, price, "Booking Payment", reference);
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
            },
        });
    }
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
        },
    });
};
exports.createBooking = createBooking;
const updateBookingStatus = async (bookingId, status, refundReference // <-- optional reference for refund
) => {
    const booking = await prisma_1.default.booking.findUnique({ where: { id: bookingId } });
    if (!booking)
        throw new Error("Booking not found");
    if (status === client_1.BookingStatus.REJECTED && booking.paymentStatus === client_1.PaymentStatus.LOCKED) {
        const wallet = await (0, wallet_service_1.getUserWallet)(booking.clientId);
        if (!wallet)
            throw new Error("Client wallet not found");
        if (!refundReference)
            throw new Error("Refund reference required");
        await (0, wallet_service_1.creditWallet)(wallet.id, booking.price, "Booking Refund", refundReference);
        return prisma_1.default.booking.update({
            where: { id: bookingId },
            data: {
                status: client_1.BookingStatus.REJECTED,
                paymentStatus: client_1.PaymentStatus.REFUNDED,
            },
        });
    }
    if (status === client_1.BookingStatus.ACCEPTED) {
        return prisma_1.default.booking.update({
            where: { id: bookingId },
            data: { status: client_1.BookingStatus.ACCEPTED },
        });
    }
    return prisma_1.default.booking.update({
        where: { id: bookingId },
        data: { status },
    });
};
exports.updateBookingStatus = updateBookingStatus;
const markBookingCompletedByClient = async (bookingId, creditReference) => {
    const booking = await prisma_1.default.booking.findUnique({ where: { id: bookingId } });
    if (!booking)
        throw new Error("Booking not found");
    const updated = await prisma_1.default.booking.update({
        where: { id: bookingId },
        data: { clientCompleted: true },
    });
    if (updated.vendorCompleted) {
        await finalizeBookingPayment(updated, creditReference);
    }
    return updated;
};
exports.markBookingCompletedByClient = markBookingCompletedByClient;
const markBookingCompletedByVendor = async (bookingId, creditReference // reference to pass on final credit
) => {
    const booking = await prisma_1.default.booking.findUnique({ where: { id: bookingId } });
    if (!booking)
        throw new Error("Booking not found");
    const updated = await prisma_1.default.booking.update({
        where: { id: bookingId },
        data: { vendorCompleted: true },
    });
    if (updated.clientCompleted) {
        await finalizeBookingPayment(updated, creditReference);
    }
    return updated;
};
exports.markBookingCompletedByVendor = markBookingCompletedByVendor;
const finalizeBookingPayment = async (booking, reference) => {
    if (booking.paymentStatus !== client_1.PaymentStatus.LOCKED) {
        throw new Error("Booking payment is not locked or already finalized");
    }
    const vendorWallet = await (0, wallet_service_1.getUserWallet)(booking.vendorId);
    if (!vendorWallet)
        throw new Error("Vendor wallet not found");
    await (0, wallet_service_1.creditWallet)(vendorWallet.id, booking.price, "Booking Payment Received", reference);
    return await prisma_1.default.booking.update({
        where: { id: booking.id },
        data: {
            paymentStatus: client_1.PaymentStatus.COMPLETED,
            status: client_1.BookingStatus.COMPLETED,
        },
    });
};
const getBookingById = async (bookingId) => {
    return await prisma_1.default.booking.findUnique({
        where: { id: bookingId },
    });
};
exports.getBookingById = getBookingById;
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
