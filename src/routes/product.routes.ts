import express from "express"
import { addProduct, fetchVendorProducts,fetchAllProducts,} from "../controllers/product.controller"
import { verifyToken, requireRole } from "../middlewares/auth.middleware"
import multer from "multer"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post(
  "/vendor/addProducts",
  verifyToken,
  requireRole(["VENDOR"]),
  upload.single("picture"),
  addProduct
)

router.get(
  "/getVendorProducts",
  verifyToken,
  requireRole(["VENDOR"]),
  fetchVendorProducts
)


router.get("/getAllProducts", fetchAllProducts)

export default router
