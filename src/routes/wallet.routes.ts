import express from "express"
import { getWalletDetails, walletTransactions,  fundWallet, verifyWalletFunding} from "../controllers/wallet.controller"
import { verifyToken } from "../middlewares/auth.middleware"

const router = express.Router()

router.get("/walletDetails", verifyToken, getWalletDetails)
router.get("/transactions", verifyToken, walletTransactions)

router.post("/fund", verifyToken, fundWallet)
router.post("/verify", verifyToken, verifyWalletFunding)


export default router
