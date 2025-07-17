import { Request, Response } from "express"
import { getPastBookings, getUpcomingBookings } from "../services/history.service"
import { Role } from "@prisma/client"

export const fetchPastHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const rawRole = req.user!.role;

    if (!["CLIENT", "VENDOR"].includes(rawRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role"
      });
    }

    const role = rawRole as Role;
    const history = await getPastBookings(userId, role);

    return res.status(200).json({
      success: true,
      message: "Past bookings fetched successfully",
      data: history
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const fetchUpcomingHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const rawRole = req.user!.role;

    if (!["CLIENT", "VENDOR"].includes(rawRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role"
      });
    }

    const role = rawRole as Role;
    const history = await getUpcomingBookings(userId, role);

    return res.status(200).json({
      success: true,
      message: "Upcoming bookings fetched successfully",
      data: history
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
