"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.markBookingCompletedByVendor = exports.markBookingCompletedByClient = exports.changeBookingStatus = exports.getMyBookings = exports.bookVendor = void 0;
const BookingService = __importStar(require("../services/booking.service"));
const notification_service_1 = require("../services/notification.service");
const bookVendor = async (req, res) => {
    const { vendorId, date, time, price, serviceName, serviceId, totalAmount, } = req.body;
    const paymentMethod = "SHARPPAY"; // Corrected to match your service
    // Payment status will be set inside the service based on wallet logic, so no need to send here.
    if (!vendorId || !date || !time || !price || !serviceName || !serviceId || !totalAmount) {
        return res.status(400).json({
            success: false,
            message: "Missing required booking details",
        });
    }
    const clientId = req.user?.id;
    try {
        const booking = await BookingService.createBooking(clientId, vendorId, serviceId, paymentMethod, serviceName, price, totalAmount, time, date);
        await (0, notification_service_1.createNotification)(vendorId, `You received a new booking request for ${serviceName} on ${date} at ${time}.`);
        await (0, notification_service_1.createNotification)(clientId, `Your booking for ${serviceName} has been placed successfully.`);
        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.bookVendor = bookVendor;
const getMyBookings = async (req, res) => {
    try {
        const role = req.user.role;
        const bookings = await BookingService.getUserBookings(req.user.id, role);
        return res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: bookings,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.getMyBookings = getMyBookings;
const changeBookingStatus = async (req, res) => {
    const { bookingId } = req.params;
    const { status, completedBy } = req.body;
    try {
        const booking = await BookingService.getBookingById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }
        let updatedBooking;
        if (status === "COMPLETED" && completedBy) {
            // Mark completion by client or vendor
            if (completedBy === "CLIENT") {
                updatedBooking = await BookingService.markBookingCompletedByClient(bookingId);
                await (0, notification_service_1.createNotification)(booking.vendorId, `Client marked booking for ${booking.serviceName} as completed.`);
            }
            else if (completedBy === "VENDOR") {
                updatedBooking = await BookingService.markBookingCompletedByVendor(bookingId);
                await (0, notification_service_1.createNotification)(booking.clientId, `Vendor marked booking for ${booking.serviceName} as completed.`);
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: "Invalid 'completedBy' value. Must be 'CLIENT' or 'VENDOR'."
                });
            }
        }
        else {
            // Normal status update: ACCEPTED, REJECTED, PENDING, etc.
            updatedBooking = await BookingService.updateBookingStatus(bookingId, status);
            await (0, notification_service_1.createNotification)(booking.clientId, `Your booking for ${booking.serviceName} was ${status.toLowerCase()}.`);
            await (0, notification_service_1.createNotification)(booking.vendorId, `You ${status.toLowerCase()} a booking for ${booking.serviceName}.`);
        }
        return res.status(200).json({
            success: true,
            message: "Booking status updated successfully",
            data: updatedBooking,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.changeBookingStatus = changeBookingStatus;
const markBookingCompletedByClient = async (req, res) => {
    try {
        const updatedBooking = await BookingService.markBookingCompletedByClient(req.params.bookingId);
        return res.status(200).json({
            success: true,
            message: "Booking marked as completed by client.",
            data: updatedBooking,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.markBookingCompletedByClient = markBookingCompletedByClient;
const markBookingCompletedByVendor = async (req, res) => {
    try {
        const updatedBooking = await BookingService.markBookingCompletedByVendor(req.params.bookingId);
        return res.status(200).json({
            success: true,
            message: "Booking marked as completed by vendor.",
            data: updatedBooking,
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
exports.markBookingCompletedByVendor = markBookingCompletedByVendor;
