// src/routes/message.routes.ts
import { Router } from "express"
import { verifyToken } from "../middlewares/auth.middleware"
import {
  fetchMessages,
  markAsRead,
  likeMessage,
  getUnreadMessageCount
} from "../controllers/message.controller"

const router = Router()

router.get("/:roomId", fetchMessages)
router.patch("/:roomId/read", markAsRead)
router.patch("/:messageId/like", likeMessage)
router.get("/unread/count", getUnreadMessageCount)


export default router
