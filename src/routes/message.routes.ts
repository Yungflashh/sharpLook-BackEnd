// src/routes/message.routes.ts
import { Router } from "express"
import { verifyToken } from "../middlewares/auth.middleware"
import {
  fetchMessages,
  markAsRead,
  likeMessage,
  getUnreadMessageCount
} from "../controllers/message.controller"
import { objectEnumValues } from "@prisma/client/runtime/library"

const router = Router()

router.get("/:roomId", verifyToken, fetchMessages)
router.patch("/:roomId/read", verifyToken, markAsRead)
router.patch("/:messageId/like", verifyToken, likeMessage)
router.get("/unread/count", verifyToken, getUnreadMessageCount)


export default router
