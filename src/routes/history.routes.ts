import express from "express"
import { fetchPastHistory, fetchUpcomingHistory } from "../controllers/history.controller"
import { verifyToken } from "../middlewares/auth.middleware"

const router = express.Router()

router.get("/past", verifyToken, fetchPastHistory)
router.get("/upcoming", verifyToken, fetchUpcomingHistory)

export default router
