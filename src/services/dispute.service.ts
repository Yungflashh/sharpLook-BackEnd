import prisma from "../config/prisma";

export const createDispute = async (
  bookingId: string,
  raisedById: string,
  reason: string
) => {
  return await prisma.dispute.create({
    data: {
      bookingId,
      raisedById,
      reason,
    },
  });
};

export const getAllDisputes = async () => {
  return await prisma.dispute.findMany({
    include: {
      raisedBy: {
        select: { firstName: true, lastName: true, role: true },
      },
      booking: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateDisputeStatus = async (
  disputeId: string,
  status: "RESOLVED" | "REJECTED",
  resolution?: string
) => {
  return await prisma.dispute.update({
    where: { id: disputeId },
    data: { status, resolution },
  });
};
