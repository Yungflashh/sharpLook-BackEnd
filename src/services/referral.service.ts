// services/referral.service.ts
import prisma from "../config/prisma"

export const trackReferral = async (referredById: string, referredUserId: string) => {
  return await prisma.referral.create({
    data: {
      referredById,
      referredUserId,
    }
  });
};

export const getUserReferrals = async (userId: string) => {
  return await prisma.referral.findMany({
    where: { referredById: userId },
    include: {
      referredUser: true
    }
  });
};
