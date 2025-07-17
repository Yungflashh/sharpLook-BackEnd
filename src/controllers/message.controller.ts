// src/controllers/message.controller.ts
import { Request, Response } from "express"
import {
  getMessagesByRoomId,
  markMessagesAsRead,
  toggleMessageLike,
  countUnreadMessages
} from "../services/message.service"

export const fetchMessages = async (req: Request, res: Response) => {
  const { roomId } = req.params;

  try {
    const messages = await getMessagesByRoomId(roomId);
    return res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: messages
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


export const markAsRead = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const userId = req.user?.id!;

  try {
    await markMessagesAsRead(roomId, userId);
    return res.status(200).json({
      success: true,
      message: "Messages marked as read"
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const likeMessage = async (req: Request, res: Response) => {
  const { messageId } = req.params;
  const userId = req.user?.id!;

  try {
    const message = await toggleMessageLike(messageId, userId);
    return res.status(200).json({
      success: true,
      message: "Message like toggled",
      data: message
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



export const getUnreadMessageCount = async (req: Request, res: Response) => {
  try {
    const count = await countUnreadMessages(req.user!.id);
    return res.status(200).json({
      success: true,
      message: "Unread message count fetched",
      data: count
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
