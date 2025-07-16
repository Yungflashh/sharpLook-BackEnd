import express from "express"
import { verifyToken, requireRole } from "../middlewares/auth.middleware"
import {uploadSingle2} from "../middlewares/upload.middleware"
import {
  createVendorService,
  fetchVendorServices
} from "../controllers/vendorService.controller"

const router = express.Router()

router.post(
  "/addService",
  verifyToken,
  requireRole(["VENDOR"]),
 uploadSingle2,
  createVendorService
)

router.get("/my-services", verifyToken, requireRole(["VENDOR"]), fetchVendorServices)

export default router
