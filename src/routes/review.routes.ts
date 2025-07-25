import express from "express"
import { fetchVendorReviews, handleGetServiceReviewsByVendor, handleGetProductReviewsByVendor} from "../controllers/review.controller"
import { verifyToken } from "../middlewares/auth.middleware"
import { postBookingReview, postProductReview, postServiceReview } from '../controllers/review.controller';

const router = express.Router()


// router.post("/postReview", verifyToken, postReview)
router.post('/reviews/booking', postBookingReview);
router.post('/product', postProductReview);
router.post('/reviews/service', postServiceReview);
router.post("/getAllReviews", fetchVendorReviews)
router.get("/:vendorId/service/:serviceId/reviews", handleGetServiceReviewsByVendor);
router.get("/:vendorId/product/:productId/reviews", handleGetProductReviewsByVendor);



export default router


