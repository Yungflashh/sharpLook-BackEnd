// services/referral.service.ts
import prisma from "../config/prisma"

// export const trackReferral = async (referredById: string, referredUserId: string) => {
//   return await prisma.referral.create({
//     data: {
//       referredById,
//       referredUserId,
//       amountEarned
//     }
//   });
// };

export const getUserReferrals = async (userId: string) => {
  return await prisma.referral.findMany({
    where: { referredById: userId },
    include: {
      referredUser: true
    }
  });
};


export const getReferralAnalytics = async (userId: string) => {
  const referrals = await prisma.referral.findMany({
    where: { referredById: userId },
    select: {
      amountEarned: true,
    },
  });

  const totalReferrals = referrals.length;
  const totalEarned = referrals.reduce((sum, r) => sum + r.amountEarned, 0);

  return { totalReferrals, totalEarned };
};