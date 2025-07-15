import { Server, Socket } from "socket.io"
import { saveMessage, markMessagesAsRead } from "../services/message.service"
import { generateRoomId } from "../utils/generateRoomId"

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("🟢 Socket connected:", socket.id)

    // Optional: if client wants to pre-join a room for listening
    socket.on("joinRoom", ({ userA, userB }) => {
      const roomId = generateRoomId(userA, userB)
      socket.join(roomId)
      console.log(`Socket ${socket.id} joined room ${roomId}`)
    })

    // When a message is sent
    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
      const roomId = generateRoomId(senderId, receiverId)

      // Save message to DB
      const saved = await saveMessage(senderId, receiverId, roomId, message)

      // Emit to both sender & receiver in the same room
      io.to(roomId).emit("newMessage", {
        id: saved.id,
        roomId,
        senderId,
        receiverId,
        message,
       timestamp: saved.createdAt,

      })
    })

          socket.on("typing", ({ roomId, senderId }) => {
        socket.to(roomId).emit("userTyping", { roomId, senderId });
      });

      socket.on("stopTyping", ({ roomId, senderId }) => {
        socket.to(roomId).emit("userStoppedTyping", { roomId, senderId });
      });


      socket.on("markAsRead", async ({ roomId, userId }) => {
  await markMessagesAsRead(roomId, userId);
  io.to(roomId).emit("messagesRead", { roomId, userId });
});


    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id)
    })
  })
}
