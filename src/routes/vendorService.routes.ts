import express from "express"
import { verifyToken, requireRole } from "../middlewares/auth.middleware"
import {uploadSingle2} from "../middlewares/upload.middleware"
import {
  createVendorService,
  fetchVendorServices,
   fetchAllVendorServices,
  updateVendorService,
  deleteAVendorService,
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

// ✅ Admin or Public: Get all vendor services
router.get("/allServices", fetchAllVendorServices);

// ✅ Vendor: Update service (can also restrict to only vendor who owns the service later)
router.put("/edit/:serviceId",verifyToken,requireRole(["VENDOR"]),updateVendorService);

// ✅ Vendor: Delete service
router.delete("/delete/:serviceId",verifyToken,requireRole(["VENDOR"]),deleteAVendorService);
export default router
