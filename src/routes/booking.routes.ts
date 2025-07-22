import express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import * as BookingController from "../controllers/booking.controller";
import {
  createBookingHandler,
  acceptBookingHandler,
  payForBookingHandler,
} from "../controllers/booking.controller"
const router = express.Router();

// Existing routes
router.post("/bookVendor", verifyToken, BookingController.bookVendor);
router.get("/getBookings", verifyToken, BookingController.getMyBookings);
router.patch("/:bookingId/status", verifyToken, BookingController.changeBookingStatus);

// New routes for marking booking completed by client or vendor
router.patch("/:bookingId/complete/client", verifyToken, BookingController.markBookingCompletedByClient);
router.patch("/:bookingId/complete/vendor", verifyToken, BookingController.markBookingCompletedByVendor);
router.post("/", verifyToken, BookingController.createBookingHandler);
router.patch("/:bookingId/accept", verifyToken, BookingController.acceptBookingHandler);
router.patch("/:bookingId/pay", verifyToken, BookingController.payForBookingHandler);





// Home service 

// User creates booking
router.post("/", verifyToken, createBookingHandler)

// Vendor accepts booking
router.patch("/:bookingId/accept", verifyToken, acceptBookingHandler)

// Client pays for booking after vendor acceptance
router.patch("/:bookingId/pay", verifyToken, payForBookingHandler)


export default router;
