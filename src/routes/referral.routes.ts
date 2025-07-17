import express from "express"
import { verifyToken } from "../middlewares/auth.middleware"
import { getReferralHistory } from "../controllers/referral.controller"

const router = express.Router()

router.get("/referralHistory", verifyToken, getReferralHistory)

export default router
