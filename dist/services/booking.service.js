"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.getBookingsByUser = exports.createBooking = void 0;
// src/services/booking.service.ts
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const createBooking = async (clientId, vendorId, date, time) => {
    try {
        return await prisma_1.default.booking.create({
            data: {
                clientId,
                vendorId,
                date,
                time,
                status: client_1.BookingStatus.PENDING,
            },
        });
    }
    catch (error) {
        throw new Error("Failed to create booking: " + error.message);
    }
};
exports.createBooking = createBooking;
const getBookingsByUser = async (userId, role, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    try {
        const whereClause = role === "CLIENT" ? { clientId: userId } : { vendorId: userId };
        const includeClause = role === "CLIENT" ? { vendor: true } : { client: true };
        const [bookings, total] = await Promise.all([
            prisma_1.default.booking.findMany({
                where: whereClause,
                include: includeClause,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma_1.default.booking.count({ where: whereClause }),
        ]);
        return {
            bookings,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }
    catch (error) {
        throw new Error("Failed to fetch bookings: " + error.message);
    }
};
exports.getBookingsByUser = getBookingsByUser;
const updateBookingStatus = async (bookingId, status) => {
    try {
        return await prisma_1.default.booking.update({
            where: { id: bookingId },
            data: { status },
        });
    }
    catch (error) {
        throw new Error("Failed to update booking status: " + error.message);
    }
};
exports.updateBookingStatus = updateBookingStatus;
