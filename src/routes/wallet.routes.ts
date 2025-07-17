import express from "express"
import { getWalletDetails, walletTransactions } from "../controllers/wallet.controller"
import { verifyToken } from "../middlewares/auth.middleware"

const router = express.Router()

router.get("/walletDetails", verifyToken, getWalletDetails)
router.get("/transactions", verifyToken, walletTransactions)


export default router
