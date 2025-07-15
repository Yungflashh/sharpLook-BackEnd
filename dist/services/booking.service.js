"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingById = exports.updateBookingStatus = exports.getUserBookings = exports.createBooking = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const createBooking = async (clientId, vendorId, date, time, price, serviceName) => {
    return await prisma_1.default.booking.create({
        data: {
            clientId,
            vendorId,
            date,
            time,
            price,
            serviceName,
            status: client_1.BookingStatus.PENDING,
        },
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
