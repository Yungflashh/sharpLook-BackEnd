import express from "express"
import { getVendorEarnings } from "../controllers/earnings.controller"
import { verifyToken, requireRole } from "../middlewares/auth.middleware"

const router = express.Router()

router.get("/getVendorEarnings", verifyToken, requireRole(["VENDOR"]), getVendorEarnings)

export default router
