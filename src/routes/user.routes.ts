import { Router } from "express"
import { getMyProfile, updateMyProfile, setClientLocationPreferences  } from "../controllers/user.controller"
import { verifyToken , requireRole} from "../middlewares/auth.middleware"
import {getNearbyVendors} from "../controllers/vendor.controller"

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

export default router
