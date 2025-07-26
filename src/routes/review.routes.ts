import express from "express"
import { postReview, fetchVendorReviews,  handleGetServiceReviewsByVendor,
  handleGetProductReviewsByVendor, } from "../controllers/review.controller"
import { verifyToken } from "../middlewares/auth.middleware"

const router = express.Router()


router.post("/postReview", verifyToken, postReview)
router.post("/getAllReviews", fetchVendorReviews)
router.get("/:vendorId/service/:serviceId", handleGetServiceReviewsByVendor);
router.get("/:vendorId/product/:productId", handleGetProductReviewsByVendor);

export default router


