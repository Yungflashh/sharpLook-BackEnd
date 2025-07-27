import express from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import * as BookingController from "../controllers/booking.controller";
import {
  createHomeServiceBooking,
  acceptBookingHandler,
  payForBookingHandler,
} from "../controllers/booking.controller"
import { uploadReferencePhoto } from "../middlewares/upload.middleware";

const router = express.Router();

// Existing routes
router.post("/bookVendor", verifyToken, BookingController.bookVendor);
router.get("/getBookings", verifyToken, BookingController.getMyBookings);
router.patch("/status", verifyToken, BookingController.changeBookingStatus);

// New routes for marking booking completed by client or vendor
router.patch("/complete/client", verifyToken, BookingController.markBookingCompletedByClient);
router.patch("/complete/vendor", verifyToken, BookingController.markBookingCompletedByVendor);
router.post("/", verifyToken, BookingController.createHomeServiceBooking);
router.patch("/accept", verifyToken, BookingController.acceptBookingHandler);
router.patch("/:bookingId/pay", verifyToken, BookingController.payForBookingHandler);





// Home service 

// User creates booking
router.post("/createHomeServiceBooking", verifyToken,   uploadReferencePhoto,
 createHomeServiceBooking)

// Vendor accepts booking
router.patch("/:bookingId/accept", verifyToken, acceptBookingHandler)

// Client pays for booking after vendor acceptance
router.patch("/:bookingId/pay", verifyToken, payForBookingHandler)


export default router;
