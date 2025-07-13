import express from "express"
import { postReview, fetchVendorReviews } from "../controllers/review.controller"
import { verifyToken } from "../middlewares/auth.middleware"

const router = express.Router()



router.post("/postReview", verifyToken, postReview)
router.get("/:vendorId", fetchVendorReviews)

export default router
