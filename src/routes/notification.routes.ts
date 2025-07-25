import express from "express"
import { getNotifications, deleteNotificationController } from "../controllers/notification.controller"
import { verifyToken } from "../middlewares/auth.middleware"

const router = express.Router()

router.get("/getNotifications", verifyToken, getNotifications)
router.delete("/delete/:notificationId", verifyToken, deleteNotificationController);

export default router
