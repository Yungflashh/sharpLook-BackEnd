// src/routes/promotion.routes.ts
import { Router } from "express"
import {
  createPromotion,
  getMyPromotions,
  getAllActivePromotions,
  changePromotionStatus
} from "../controllers/promotion.controller"
import { verifyToken, requireRole } from "../middlewares/auth.middleware"

const router = Router()

// Vendor only
router.post("/createPromotion", verifyToken, requireRole(["VENDOR"]), createPromotion)
router.get("/getMyPromotions", verifyToken, requireRole(["VENDOR"]), getMyPromotions)
router.patch("/:promotionId/status", verifyToken, requireRole(["VENDOR"]), changePromotionStatus)

// Public
router.get("/active", getAllActivePromotions)

export default router
