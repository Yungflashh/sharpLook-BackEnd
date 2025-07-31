import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const  markVendorAsPaid= async(userId: string, planName: string, amount: number)=> {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await prisma.vendorSubscription.update({
    where: { userId },
    data: {
      isPaid: true,
      paidAt: now,
      expiresAt: nextMonth,
      planName,
      amount,
      updatedAt: new Date(),
    },
  });
}
