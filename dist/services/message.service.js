"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleMessageLike = exports.markMessagesAsRead = exports.getMessagesByRoomId = exports.saveMessage = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// Save a new message
const saveMessage = async (senderId, receiverId, roomId, message) => {
    return await prisma_1.default.message.create({
        data: {
            senderId,
            receiverId,
            roomId,
            message,
        },
    });
};
exports.saveMessage = saveMessage;
// Get all messages for a room
const getMessagesByRoomId = async (roomId) => {
    return await prisma_1.default.message.findMany({
        where: { roomId },
        orderBy: { createdAt: "asc" },
    });
};
exports.getMessagesByRoomId = getMessagesByRoomId;
// Mark messages as read by user
const markMessagesAsRead = async (roomId, userId) => {
    return await prisma_1.default.message.updateMany({
        where: {
            roomId,
            receiverId: userId,
            read: false,
        },
        data: {
            read: true,
        },
    });
};
exports.markMessagesAsRead = markMessagesAsRead;
const toggleMessageLike = async (messageId, userId) => {
    const message = await prisma_1.default.message.findUnique({
        where: { id: messageId },
        select: { likedBy: true }
    });
    if (!message)
        throw new Error("Message not found");
    // Ensure likedBy is an array
    const likedBy = message.likedBy ?? [];
    const hasLiked = likedBy.includes(userId);
    const updatedLikedBy = hasLiked
        ? likedBy.filter((id) => id !== userId)
        : [...likedBy, userId];
    const updated = await prisma_1.default.message.update({
        where: { id: messageId },
        data: {
            likedBy: { set: updatedLikedBy } // ✅ Prisma expects { set: string[] }
        }
    });
    return updated;
};
exports.toggleMessageLike = toggleMessageLike;
