"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = void 0;
const message_service_1 = require("../services/message.service");
const generateRoomId_1 = require("../utils/generateRoomId");
const registerSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        console.log("🟢 Socket connected:", socket.id);
        // Optional: if client wants to pre-join a room for listening
        socket.on("joinRoom", ({ userA, userB }) => {
            const roomId = (0, generateRoomId_1.generateRoomId)(userA, userB);
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });
        // When a message is sent
        socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
            const roomId = (0, generateRoomId_1.generateRoomId)(senderId, receiverId);
            // Save message to DB
            const saved = await (0, message_service_1.saveMessage)(senderId, receiverId, roomId, message);
            // Emit to both sender & receiver in the same room
            io.to(roomId).emit("newMessage", {
                id: saved.id,
                roomId,
                senderId,
                receiverId,
                message,
                timestamp: saved.createdAt,
            });
        });
        socket.on("disconnect", () => {
            console.log("🔴 Socket disconnected:", socket.id);
        });
    });
};
exports.registerSocketHandlers = registerSocketHandlers;
