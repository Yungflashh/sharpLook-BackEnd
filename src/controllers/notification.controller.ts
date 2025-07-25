import { Request, Response, NextFunction } from "express";
import { getUserNotifications, deleteNotification } from "../services/notification.service";

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


export const deleteNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { notificationId } = req.params;
    await deleteNotification(notificationId);
    res.status(200).json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};