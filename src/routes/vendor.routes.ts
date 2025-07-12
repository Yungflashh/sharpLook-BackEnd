// src/routes/vendor.routes.ts
import { Router } from "express"
import { verifyToken, requireRole } from "../middlewares/auth.middleware"
import { completeVendorProfile } from "../controllers/vendor.controller"
import { uploadPortfolioImages, fetchPortfolioImages } from "../controllers/vendor.controller"

import { uploadMultiple } from "../middlewares/upload.middleware"



const router = Router()

router.get("/dashboard", verifyToken, requireRole(["VENDOR"]),(req, res) => {
res.json({ message: "Welcome, Vendor!" })
  }
)
router.put("/complete-profile", verifyToken, requireRole(["VENDOR"]), completeVendorProfile)
router.post("/upload", verifyToken, uploadMultiple, uploadPortfolioImages)
router.get("/", verifyToken, fetchPortfolioImages)


export default router
