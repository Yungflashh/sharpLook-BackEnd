// routes/wishlist.routes.ts
import { Router } from "express"
import * as WishlistController from "../controllers/wishlist.controller"
import { verifyToken } from "../middlewares/auth.middleware"

const router = Router()

router.post("/addProduct", verifyToken, WishlistController.addProductToWishlist)
router.get("/getMyWish", verifyToken, WishlistController.getMyWishlist)
router.delete("/removeProduct/:productId", verifyToken, WishlistController.removeProductFromWishlist)

export default router
