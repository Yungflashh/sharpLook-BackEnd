// src/routes/admin.routes.ts
import { Router } from "express"
import * as AdminController from "../controllers/admin.controller"
import { verifyToken } from "../middlewares/auth.middleware"
import { requireAdmin } from "../middlewares/admin.middleware"

const router = Router()

router.use(verifyToken, requireAdmin)

router.get("/users", AdminController.getAllUsers)
router.get("/bookings", AdminController.getAllBookings)
router.put("/users/:userId/ban", AdminController.banUser)
router.put("/users/:userId/promote", AdminController.promoteToAdmin)

export default router
