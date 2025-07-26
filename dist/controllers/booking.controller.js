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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payForBookingHandler = exports.acceptBookingHandler = exports.createHomeServiceBooking = exports.markBookingCompletedByVendor = exports.markBookingCompletedByClient = exports.changeBookingStatus = exports.getMyBookings = exports.bookVendor = void 0;
const BookingService = __importStar(require("../services/booking.service"));
const notification_service_1 = require("../services/notification.service");
const booking_service_1 = require("../services/booking.service");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const prisma_1 = __importDefault(require("../config/prisma"));
const bookVendor = async (req, res) => {
    const { vendorId, date, time, price, serviceName, serviceId, totalAmount, reference, paymentMethod } = req.body;
    // Corrected to match your service
    // Payment status will be set inside the service based on wallet logic, so no need to send here.
    if (!vendorId || !date || !time || !price || !serviceName || !serviceId || !totalAmount) {
        return res.status(400).json({
            success: false,
            message: "Missing required booking details",
        });
    }
    const clientId = req.user?.id;
    try {
        const booking = await BookingService.createBooking(clientId, vendorId, serviceId, paymentMethod, serviceName, price, totalAmount, time, date, reference);
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
    const { status, completedBy, reference } = req.body;
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
                updatedBooking = await BookingService.markBookingCompletedByClient(bookingId, reference);
                await (0, notification_service_1.createNotification)(booking.vendorId, `Client marked booking for ${booking.serviceName} as completed.`);
            }
            else if (completedBy === "VENDOR") {
                updatedBooking = await BookingService.markBookingCompletedByVendor(bookingId, reference);
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
    const { reference, bookingId } = req.body;
    try {
        const updatedBooking = await BookingService.markBookingCompletedByClient(bookingId, reference);
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
    const { reference, bookingId } = req.body;
    try {
        const updatedBooking = await BookingService.markBookingCompletedByVendor(bookingId, reference);
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
// hpome servcie 
const createHomeServiceBooking = async (req, res) => {
    try {
        const { clientId, vendorId, serviceId, paymentMethod, serviceName, price, totalAmount, time, date, reference, serviceType, serviceLocation, fullAddress, landmark, specialInstruction, } = req.body;
        let referencePhotoUrl = "";
        if (req.file) {
            const uploadResult = await (0, cloudinary_1.default)(req.file.buffer, req.file.mimetype);
            referencePhotoUrl = uploadResult.secure_url;
        }
        const booking = await (0, booking_service_1.homeServiceCreateBooking)(clientId, vendorId, serviceId, paymentMethod, serviceName, Number(price), Number(totalAmount), time, date, reference, serviceType, {
            serviceLocation,
            fullAddress,
            landmark,
            referencePhoto: referencePhotoUrl,
            specialInstruction,
        });
        const vendor = await prisma_1.default.vendorOnboarding.findUnique({
            where: { id: vendorId },
            select: {
                user: {
                    select: { id: true, firstName: true },
                },
            },
        });
        if (vendor?.user?.id) {
            await (0, notification_service_1.createNotification)(vendor.user.id, `You have a new home service booking for ${serviceName} on ${date} at ${time}`);
        }
        await (0, notification_service_1.createNotification)(clientId, `Your booking for ${serviceName} on ${date} at ${time} was successful.`);
        return res.status(201).json({
            message: "Booking created successfully",
            data: booking,
        });
    }
    catch (err) {
        console.error("Create booking error:", err);
        return res.status(500).json({ error: err.message || "Server Error" });
    }
};
exports.createHomeServiceBooking = createHomeServiceBooking;
const acceptBookingHandler = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const vendorId = req.user.id;
        const booking = await (0, booking_service_1.acceptBooking)(vendorId, bookingId);
        // TODO: Notify client about acceptance (e.g., socket or push notification)
        res.json({ success: true, message: "Booking accepted", data: booking });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message || "Failed to accept booking" });
    }
};
exports.acceptBookingHandler = acceptBookingHandler;
const payForBookingHandler = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const clientId = req.user.id;
        const { reference, paymentMethod } = req.body;
        const booking = await (0, booking_service_1.payForAcceptedBooking)(clientId, bookingId, reference, paymentMethod);
        // TODO: Notify vendor about payment (e.g., socket or push notification)
        res.json({ success: true, message: "Booking paid", data: booking });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message || "Failed to pay for booking" });
    }
};
exports.payForBookingHandler = payForBookingHandler;
