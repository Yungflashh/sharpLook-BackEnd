import { Router } from "express"
import { getMyProfile, updateMyProfile, setClientLocationPreferences, fetchTopVendors, getAVendorDetails  } from "../controllers/user.controller"
import { verifyToken , requireRole} from "../middlewares/auth.middleware"
import {getNearbyVendors} from "../controllers/vendor.controller"
import {fetchTopSellingProducts} from "../controllers/product.controller"

const router = Router()

router.get("/me", verifyToken, getMyProfile)
router.put("/me", verifyToken, updateMyProfile)
router.put(
  "/location",
  verifyToken,
  requireRole(["CLIENT"]),
  setClientLocationPreferences
)
router.get("/nearby-vendors", getNearbyVendors)
router.get("/topVendors", fetchTopVendors)
router.get("/getVendorDetails", getAVendorDetails)
router.get("/products/top-selling", fetchTopSellingProducts)



export default router
