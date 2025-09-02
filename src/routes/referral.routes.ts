import express from "express"
import { verifyToken } from "../middlewares/auth.middleware"
import { getReferralHistory, handleReferralAnalytics } from "../controllers/referral.controller"

const router = express.Router()

router.get("/referralHistory", verifyToken, getReferralHistory)
router.get("/analytics", verifyToken, handleReferralAnalytics);


export default router



