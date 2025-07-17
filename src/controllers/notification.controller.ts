import { Request, Response } from "express";
import { getUserNotifications } from "../services/notification.service";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const notifications = await getUserNotifications(userId);

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
