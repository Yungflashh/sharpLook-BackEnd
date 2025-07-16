import { Request, Response } from "express"
import { getPastBookings, getUpcomingBookings } from "../services/history.service"
import { Role } from "@prisma/client"

export const fetchPastHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const rawRole = req.user!.role

    if (!["CLIENT", "VENDOR"].includes(rawRole)) {
      return res.status(400).json({ error: "Invalid user role" })
    }

    const role = rawRole as Role
    const history = await getPastBookings(userId, role)

    res.json({ success: true, data: history })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const fetchUpcomingHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const rawRole = req.user!.role

    if (!["CLIENT", "VENDOR"].includes(rawRole)) {
      return res.status(400).json({ error: "Invalid user role" })
    }

    const role = rawRole as Role
    const history = await getUpcomingBookings(userId, role)

    res.json({ success: true, data: history })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
