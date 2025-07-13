import express from "express"
import { verifyToken } from "../middlewares/auth.middleware"
import * as BookingController from "../controllers/booking.controller"

const router = express.Router()

router.post("/bookVendor", verifyToken, BookingController.bookVendor)
router.get("/getBookings", verifyToken, BookingController.getMyBookings)
router.patch("/:bookingId/status", verifyToken, BookingController.changeBookingStatus)

export default router
