import { Request, Response } from "express"
import { getUserNotifications } from "../services/notification.service"

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const notifications = await getUserNotifications(userId)
    res.json({ success: true, data: notifications })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
