import express from "express"
import { addProduct, fetchVendorProducts,fetchAllProducts, editProduct, removeProduct} from "../controllers/product.controller"
import { verifyToken, requireRole } from "../middlewares/auth.middleware"
import { uploadSingle2 } from "../middlewares/upload.middleware"
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

router.get("/getVendorProducts",verifyToken,requireRole(["VENDOR"]),fetchVendorProducts)
router.get("/getAllProducts", fetchAllProducts)
router.put("/edit/:productId", verifyToken,  upload.single("picture"), requireRole(["VENDOR"]), editProduct)
router.delete("/delete/:productId", verifyToken,requireRole(["VENDOR"]), removeProduct)

export default router
