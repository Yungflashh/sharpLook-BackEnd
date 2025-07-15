// src/controllers/message.controller.ts
import { Request, Response } from "express"
import {
  getMessagesByRoomId,
  markMessagesAsRead,
  toggleMessageLike,
  countUnreadMessages
} from "../services/message.service"

export const fetchMessages = async (req: Request, res: Response) => {
  const { roomId } = req.params

  try {
    const messages = await getMessagesByRoomId(roomId)
    res.json({ success: true, data: messages })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const markAsRead = async (req: Request, res: Response) => {
  const { roomId } = req.params
  const userId = req.user?.id!

  try {
    await markMessagesAsRead(roomId, userId)
    res.json({ success: true, message: "Messages marked as read" })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const likeMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params
  const userId = req.user?.id!

  try {
    const message = await toggleMessageLike(messageId, userId)
    res.json({ success: true, data: message })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}



// Add to `message.controller.ts`
export const getUnreadMessageCount = async (req: Request, res: Response) => {
  try {
    const count = await countUnreadMessages(req.user!.id)
    res.json({ success: true, data: count })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}