import prisma from "../config/prisma";

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
  });
};

export const getMessagesByRoomId = async (roomId: string) => {
  return await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
  });
};

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
  });
};

export const toggleMessageLike = async (messageId: string, userId: string) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { likedBy: true },
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
      likedBy: { set: updatedLikedBy }, // ✅ Prisma expects { set: string[] }
    },
  });

  return updated;
};

export const countUnreadMessages = async (userId: string) => {
  return await prisma.message.count({
    where: {
      receiverId: userId,
      read: false,
    },
  });
};
export const getChatListForUser = async (userId: string) => {
  const rooms = await prisma.message.findMany({
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

  return rooms.map((room) => {
    const isSender = room.sender.id === userId;
    const self = isSender ? room.sender : room.receiver;
    const chatPartner = isSender ? room.receiver : room.sender;

    const getDisplayName = () => {
      if (self.role === 'CLIENT' && chatPartner.role === 'VENDOR') {
        // Client chatting with vendor → show business name
        return chatPartner.vendorOnboarding?.businessName ?? `${chatPartner.firstName} ${chatPartner.lastName}`;
      } else if (self.role === 'VENDOR' && chatPartner.role === 'CLIENT') {
        // Vendor chatting with client → show first name
        return chatPartner.firstName;
      }
      // Fallback for any other case
      return `${chatPartner.firstName} ${chatPartner.lastName}`;
    };

    const formatUser = (user: any) => ({
      id: user.id,
      name:
        user.role === "VENDOR" && user.vendorOnboarding?.businessName
          ? user.vendorOnboarding.businessName
          : `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
    });

    return {
      roomId: room.roomId,
      createdAt: room.createdAt,
      chatPartner: {
        ...formatUser(chatPartner),
        name: getDisplayName(),
      },
      sender: formatUser(room.sender),
      receiver: formatUser(room.receiver),
    };
  });
};


export const getChatPreviews = async (userId: string) => {
  const rooms = await getChatListForUser(userId);

  const previews = await Promise.all(
    rooms.map(async (room) => {
      const lastMessage = await prisma.message.findFirst({
        where: { roomId: room.roomId },
        orderBy: { createdAt: "desc" },
      });

      return {
        roomId: room.roomId,
        lastMessage,
      };
    })
  );

  return previews;
};


export const deleteMessage = async (messageId: string) => {
  return await prisma.message.delete({
    where: { id: messageId },
  });
};

export const editMessage = async (messageId: string, newText: string) => {
  return await prisma.message.update({
    where: { id: messageId },
    data: { message: newText },
  });
};

