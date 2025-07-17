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
exports.changeBookingStatus = exports.getMyBookings = exports.bookVendor = void 0;
const BookingService = __importStar(require("../services/booking.service"));
const notification_service_1 = require("../services/notification.service");
const bookVendor = async (req, res) => {
    const { vendorId, date, time, price, serviceName, location, paymentMethod, notes, status, serviceId } = req.body;
    if (!vendorId || !date || !time || !price || !serviceName || !location || !paymentMethod || !status || !serviceId) {
        return res.status(400).json({ error: "Missing required booking details" });
    }
    const clientId = req.user?.id;
    try {
        const booking = await BookingService.createBooking(clientId, vendorId, date, time, price, serviceName, location, paymentMethod, notes || "", status, serviceId);
        await (0, notification_service_1.createNotification)(vendorId, `You received a new booking request for ${serviceName} on ${date} at ${time}.`);
        await (0, notification_service_1.createNotification)(clientId, `Your booking for ${serviceName} has been placed successfully.`);
        res.status(201).json({ success: true, data: booking });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.bookVendor = bookVendor;
const getMyBookings = async (req, res) => {
    try {
        const role = req.user.role;
        const bookings = await BookingService.getUserBookings(req.user.id, role);
        res.json({ success: true, data: bookings });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.getMyBookings = getMyBookings;
const changeBookingStatus = async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;
    try {
        const updated = await BookingService.updateBookingStatus(bookingId, status);
        const booking = await BookingService.getBookingById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        await (0, notification_service_1.createNotification)(booking.clientId, `Your booking for ${booking.serviceName} was ${status.toLowerCase()}.`);
        await (0, notification_service_1.createNotification)(booking.vendorId, `You ${status.toLowerCase()} a booking for ${booking.serviceName}.`);
        res.json({ success: true, message: "Booking status updated", data: updated });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.changeBookingStatus = changeBookingStatus;
