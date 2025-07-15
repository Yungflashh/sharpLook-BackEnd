// src/controllers/admin.controller.ts
import { Request, Response } from "express"
import * as AdminService from "../services/admin.service"

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await AdminService.getAllUsers()
  res.json({ success: true, data: users })
}

export const getAllBookings = async (req: Request, res: Response) => {
  const bookings = await AdminService.getAllBookings()
  res.json({ success: true, data: bookings })
}

export const banUser = async (req: Request, res: Response) => {
  const { userId } = req.params
  await AdminService.banUser(userId)
  res.json({ success: true, message: "User banned" })
}

export const promoteToAdmin = async (req: Request, res: Response) => {
  const { userId } = req.params
  await AdminService.promoteUserToAdmin(userId)
  res.json({ success: true, message: "User promoted to ADMIN" })
}
