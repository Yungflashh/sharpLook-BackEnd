import { Router } from "express"
import { fetchAllServices, fetchVendorServices } from "../controllers/clientService.controller"

const router = Router()

router.get("/services", fetchAllServices)
router.get("/services/:vendorId", fetchVendorServices)

export default router
