// src/routes/admin.routes.ts
import { Router } from "express"
import * as AdminController from "../controllers/admin.controller"
import { verifyToken } from "../middlewares/auth.middleware"
import { requireAdmin } from "../middlewares/admin.middleware"


const router = Router()

router.use(verifyToken, requireAdmin)

router.get("/users",verifyToken, requireAdmin,  AdminController.getAllUsers)
router.get("/bookings", requireAdmin, AdminController.getAllBookings)
router.put("/users/:userId/ban",requireAdmin, AdminController.banUser)
router.put("/promote/:adminId", requireAdmin, AdminController.promoteToAdmin)
router.get("/users", requireAdmin, AdminController.getAllUsersByRole);
router.get("/users/new",requireAdmin, AdminController.getNewUsersByRange);
router.get("/users/active",requireAdmin, AdminController.getDailyActiveUsers);
router.get("/products",requireAdmin, AdminController.getAllProducts);
router.get("/products/sold",requireAdmin, AdminController.getSoldProducts);
router.delete("/users/:userId", requireAdmin, AdminController.deleteUser);
router.get("/users/:userId", requireAdmin, AdminController.getUserDetail);
router.patch("/products/:productId/approve", requireAdmin, AdminController.approveProduct);
router.patch("/products/:productId/suspend", requireAdmin, AdminController.suspendProduct);
router.delete("/products/:productId", requireAdmin, AdminController.deleteProduct);

// ✅ Disputes
router.patch("/disputes/:disputeId/resolve", requireAdmin, AdminController.resolveDispute);

// ...etc

export default router;


