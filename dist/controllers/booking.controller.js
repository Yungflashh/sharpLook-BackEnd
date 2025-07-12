"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.getByUser = exports.create = void 0;
const booking_service_1 = require("../services/booking.service");
const create = async (req, res) => {
    try {
        const { vendorId, date, time } = req.body;
        const booking = await (0, booking_service_1.createBooking)(req.user.id, vendorId, new Date(date), time);
        res.status(201).json({ success: true, data: booking });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.create = create;
const getByUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const role = req.user.role;
        if (role !== "CLIENT" && role !== "VENDOR") {
            return res.status(403).json({ error: "Unauthorized role for booking access" });
        }
        const result = await (0, booking_service_1.getBookingsByUser)(req.user.id, role, page, limit);
        res.json({ success: true, ...result });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.getByUser = getByUser;
const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await (0, booking_service_1.updateBookingStatus)(req.params.id, status);
        res.json({ success: true, message: "Booking status updated", data: booking });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.updateStatus = updateStatus;
