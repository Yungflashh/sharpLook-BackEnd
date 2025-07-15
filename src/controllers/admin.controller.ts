// src/controllers/admin.controller.ts
import { Request, Response } from "express"
import * as AdminService from "../services/admin.service"
import { Role } from "@prisma/client"

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


export const getAllUsersByRole = async (req: Request, res: Response) => {
  const { role } = req.query;

  try {
    const users = await AdminService.getUsersByRole(role as Role);
    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getNewUsersByRange = async (req: Request, res: Response) => {
  const { range } = req.query; // e.g. "days", "weeks", "months", "years"

  try {
    const users = await AdminService.getNewUsersByRange(range as string);
    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


export const getDailyActiveUsers = async (_req: Request, res: Response) => {
  try {
    const users = await AdminService.getDailyActiveUsers();
    res.json({ success: true, data: users });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await AdminService.getAllProducts();
    res.json({ success: true, data: products });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getSoldProducts = async (_req: Request, res: Response) => {
  try {
    const products = await AdminService.getSoldProducts();
    res.json({ success: true, data: products });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


