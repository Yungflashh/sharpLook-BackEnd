import express from "express"
import { addProduct, fetchVendorProducts,fetchAllProducts, editProduct, removeProduct} from "../controllers/product.controller"
import { verifyToken, requireRole } from "../middlewares/auth.middleware"
import { uploadSingle2 } from "../middlewares/upload.middleware"

const router = express.Router()


router.post(
  "/vendor/addProducts",
  verifyToken,
  requireRole(["VENDOR"]),
  uploadSingle2,
  addProduct
)

router.get("/getVendorProducts",verifyToken,requireRole(["VENDOR"]),fetchVendorProducts)
router.get("/getAllProducts", fetchAllProducts)
router.put("/:productId", verifyToken, uploadSingle2, requireRole(["VENDOR"]), editProduct)
router.delete("/:productId", verifyToken,requireRole(["VENDOR"]), removeProduct)

export default router
