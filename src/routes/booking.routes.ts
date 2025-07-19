import express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import * as BookingController from "../controllers/booking.controller";

const router = express.Router();

// Existing routes
router.post("/bookVendor", verifyToken, BookingController.bookVendor);
router.get("/getBookings", verifyToken, BookingController.getMyBookings);
router.patch("/:bookingId/status", verifyToken, BookingController.changeBookingStatus);

// New routes for marking booking completed by client or vendor
router.patch("/:bookingId/complete/client", verifyToken, BookingController.markBookingCompletedByClient);
router.patch("/:bookingId/complete/vendor", verifyToken, BookingController.markBookingCompletedByVendor);

export default router;
