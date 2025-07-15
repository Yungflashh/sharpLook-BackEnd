"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeMessage = exports.markAsRead = exports.fetchMessages = void 0;
const message_service_1 = require("../services/message.service");
const fetchMessages = async (req, res) => {
    const { roomId } = req.params;
    try {
        const messages = await (0, message_service_1.getMessagesByRoomId)(roomId);
        res.json({ success: true, data: messages });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.fetchMessages = fetchMessages;
const markAsRead = async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user?.id;
    try {
        await (0, message_service_1.markMessagesAsRead)(roomId, userId);
        res.json({ success: true, message: "Messages marked as read" });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.markAsRead = markAsRead;
const likeMessage = async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user?.id;
    try {
        const message = await (0, message_service_1.toggleMessageLike)(messageId, userId);
        res.json({ success: true, data: message });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.likeMessage = likeMessage;
