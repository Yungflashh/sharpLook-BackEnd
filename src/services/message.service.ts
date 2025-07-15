import prisma from "../config/prisma"

// Save a new message
export const saveMessage = async (
  senderId: string,
  receiverId: string,
  roomId: string,
  message: string
) => {
  return await prisma.message.create({
    data: {
      senderId,
      receiverId,
      roomId,
      message,
    },
  })
}

// Get all messages for a room
export const getMessagesByRoomId = async (roomId: string) => {
  return await prisma.message.findMany({
    where: { roomId },
     orderBy: { createdAt: "asc" },
  })
}

// Mark messages as read by user
export const markMessagesAsRead = async (roomId: string, userId: string) => {
  return await prisma.message.updateMany({
    where: {
      roomId,
      receiverId: userId,
      read: false,
    },
    data: {
      read: true,
    },
  })
}


export const toggleMessageLike = async (messageId: string, userId: string) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { likedBy: true }
  });

  if (!message) throw new Error("Message not found");

  // Ensure likedBy is an array
  const likedBy: string[] = message.likedBy ?? [];

  const hasLiked = likedBy.includes(userId);

  const updatedLikedBy = hasLiked
    ? likedBy.filter((id) => id !== userId)
    : [...likedBy, userId];

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: {
      likedBy: { set: updatedLikedBy } // ✅ Prisma expects { set: string[] }
    }
  });

  return updated;
};

