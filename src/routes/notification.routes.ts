import express from "express"
import { getNotifications } from "../controllers/notification.controller"
import { verifyToken } from "../middlewares/auth.middleware"

const router = express.Router()

router.get("/getNotifications", verifyToken, getNotifications)

export default router
