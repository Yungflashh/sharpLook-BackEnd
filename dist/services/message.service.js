"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editMessage = exports.deleteMessage = exports.getChatPreviews = exports.getChatListForUser = exports.countUnreadMessages = exports.toggleMessageLike = exports.markMessagesAsRead = exports.getMessagesByRoomId = exports.saveMessage = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
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
const getMessagesByRoomId = async (roomId) => {
    return await prisma_1.default.message.findMany({
        where: { roomId },
        orderBy: { createdAt: "asc" },
    });
};
exports.getMessagesByRoomId = getMessagesByRoomId;
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
        select: { likedBy: true },
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
            likedBy: { set: updatedLikedBy }, // ✅ Prisma expects { set: string[] }
        },
    });
    return updated;
};
exports.toggleMessageLike = toggleMessageLike;
const countUnreadMessages = async (userId) => {
    return await prisma_1.default.message.count({
        where: {
            receiverId: userId,
            read: false,
        },
    });
};
exports.countUnreadMessages = countUnreadMessages;
const getChatListForUser = async (userId) => {
    const rooms = await prisma_1.default.message.findMany({
        where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
        },
        select: {
            roomId: true,
            createdAt: true,
            sender: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    role: true,
                    avatar: true,
                    vendorOnboarding: {
                        select: {
                            businessName: true,
                        },
                    },
                },
            },
            receiver: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    role: true,
                    avatar: true,
                    vendorOnboarding: {
                        select: {
                            businessName: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
        distinct: ["roomId"],
    });
    const formatUser = (user) => ({
        id: user.id,
        name: user.role === "VENDOR" && user.vendorOnboarding?.businessName
            ? user.vendorOnboarding.businessName
            : `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
    });
    return rooms.map((room) => {
        const isSender = room.sender.id === userId;
        const chatPartner = isSender ? room.receiver : room.sender;
        return {
            roomId: room.roomId,
            createdAt: room.createdAt,
            chatPartner: formatUser(chatPartner), // <- this is what frontend should display
            sender: formatUser(room.sender),
            receiver: formatUser(room.receiver),
        };
    });
};
exports.getChatListForUser = getChatListForUser;
const getChatPreviews = async (userId) => {
    const rooms = await (0, exports.getChatListForUser)(userId);
    const previews = await Promise.all(rooms.map(async (room) => {
        const lastMessage = await prisma_1.default.message.findFirst({
            where: { roomId: room.roomId },
            orderBy: { createdAt: "desc" },
        });
        return {
            roomId: room.roomId,
            lastMessage,
        };
    }));
    return previews;
};
exports.getChatPreviews = getChatPreviews;
const deleteMessage = async (messageId) => {
    return await prisma_1.default.message.delete({
        where: { id: messageId },
    });
};
exports.deleteMessage = deleteMessage;
const editMessage = async (messageId, newText) => {
    return await prisma_1.default.message.update({
        where: { id: messageId },
        data: { message: newText },
    });
};
exports.editMessage = editMessage;
