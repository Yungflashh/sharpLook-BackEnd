// src/routes/message.routes.ts
import { Router } from "express"
import { verifyToken } from "../middlewares/auth.middleware"
import {
  fetchMessages,
  markAsRead,
  likeMessage
} from "../controllers/message.controller"

const router = Router()

router.use(verifyToken)

router.get("/:roomId", fetchMessages)
router.patch("/:roomId/read", markAsRead)
router.patch("/:messageId/like", likeMessage)

export default router
