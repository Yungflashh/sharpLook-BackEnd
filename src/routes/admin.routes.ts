// src/routes/admin.routes.ts
import { Router } from "express"
import * as AdminController from "../controllers/admin.controller"
import { verifyToken } from "../middlewares/auth.middleware"
import { requireAdmin } from "../middlewares/admin.middleware"

const router = Router()

router.use(verifyToken, requireAdmin)

router.get("/users",verifyToken,  AdminController.getAllUsers)
router.get("/bookings", AdminController.getAllBookings)
router.put("/users/:userId/ban", AdminController.banUser)
router.put("/users/:userId/promote", AdminController.promoteToAdmin)
router.get("/users", AdminController.getAllUsersByRole);
router.get("/users/new", AdminController.getNewUsersByRange);
router.get("/users/active", AdminController.getDailyActiveUsers);
router.get("/products", AdminController.getAllProducts);
router.get("/products/sold", AdminController.getSoldProducts);

export default router
