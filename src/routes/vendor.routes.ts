// src/routes/vendor.routes.ts
import { Router } from "express"
import { verifyToken, requireRole } from "../middlewares/auth.middleware"
import { completeVendorProfile } from "../controllers/vendor.controller"
import { uploadPortfolioImages,
         fetchPortfolioImages, 
         setVendorSpecialties, 
         fetchVendorSpecialties, 
         fetchAvailability, 
         updateAvailability,
        updateServiceRadius,
      getNearbyVendors  } from "../controllers/vendor.controller"
import { uploadMultiple } from "../middlewares/upload.middleware"
import { setVendorPricing, fetchVendorPricing } from "../controllers/vendorPricing.controller"




const router = Router()

router.get("/dashboard", verifyToken, requireRole(["VENDOR"]),(req, res) => {
res.json({ message: "Welcome, Vendor!" })
  }
)
router.put("/complete-profile", completeVendorProfile)
router.post("/upload", verifyToken, requireRole(["VENDOR"]), uploadMultiple,  uploadPortfolioImages)
router.get("/fetchPortfolioImage", verifyToken, requireRole(["VENDOR"]), fetchPortfolioImages)
router.get("/getVendorPricing", verifyToken, requireRole(["VENDOR"]), fetchVendorPricing)
router.post("/setVendorPricing", verifyToken, requireRole(["VENDOR"]), setVendorPricing)
router.post("/setVendorSpecialities", verifyToken, requireRole(["VENDOR"]), setVendorSpecialties)
router.get("/getVendorSpecialities", verifyToken, requireRole(["VENDOR"]), fetchVendorSpecialties )
router.post("/setVendorAvailability", verifyToken, requireRole(["VENDOR"]), updateAvailability)
router.get("/getVendorAvailability", verifyToken, requireRole(["VENDOR"]),  fetchAvailability)
router.put("/update-service-radius",verifyToken,requireRole(["VENDOR"]),updateServiceRadius)
router.get("/nearby-vendors", getNearbyVendors)



export default router
