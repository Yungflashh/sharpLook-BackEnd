// src/routes/booking.routes.ts
import { Router } from "express"
import { create, getByUser, updateStatus } from "../controllers/booking.controller"
import { verifyToken } from "../middlewares/auth.middleware"

const router = Router()

router.post("/createBooking", verifyToken, create)
router.get("/getBooking", verifyToken, getByUser)
router.patch("/:id/status", verifyToken, updateStatus)

export default router
