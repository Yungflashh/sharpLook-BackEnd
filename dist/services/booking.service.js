"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingById = exports.updateBookingStatus = exports.getUserBookings = exports.createBooking = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const wallet_service_1 = require("./wallet.service");
const createBooking = async (clientId, vendorId, serviceId, amount, paymentMethod, serviceName, price, paymentStatus, totalAmount, time, date) => {
    if (paymentMethod === "WALLET") {
        const wallet = await (0, wallet_service_1.getUserWallet)(clientId);
        if (!wallet || wallet.balance < amount) {
            throw new Error("Insufficient wallet balance");
        }
        await (0, wallet_service_1.debitWallet)(wallet.id, amount, "Booking Payment");
    }
    return await prisma_1.default.booking.create({
        data: {
            clientId,
            vendorId,
            serviceId,
            totalAmount,
            paymentMethod, // "WALLET" | "CARD"
            paymentStatus, // e.g. "PENDING"
            serviceName,
            date, // e.g. new Date().toISOString().split("T")[0]
            time, // e.g. "12:00 PM"
            price, // probably the same as totalAmount or service price
            status: "PENDING", // or "CONFIRMED", depending on logic
        }
    });
};
exports.createBooking = createBooking;
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
    return await prisma_1.default.booking.update({
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
