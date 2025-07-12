// src/controllers/booking.controller.ts
import { Request, Response } from "express"
import {
  createBooking,
  getBookingsByUser,
  updateBookingStatus,
} from "../services/booking.service"

export const create = async (req: Request, res: Response) => {
  try {
    const { vendorId, date, time } = req.body
    const booking = await createBooking(req.user!.id, vendorId, new Date(date), time)
    res.status(201).json({ success: true, data: booking })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const getByUser = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const role = req.user!.role
    if (role !== "CLIENT" && role !== "VENDOR") {
    return res.status(403).json({ error: "Unauthorized role for booking access" })
    }

    const result = await getBookingsByUser(req.user!.id, role, page, limit)


    res.json({ success: true, ...result })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body
    const booking = await updateBookingStatus(req.params.id, status)
    res.json({ success: true, message: "Booking status updated", data: booking })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
