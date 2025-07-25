import prisma from "../config/prisma";

export const requestWithdrawalService = async (userId: string, amount: number, reason: string, method: string, metadata: any) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });

  if (!wallet || wallet.balance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  // Lock funds
  await prisma.wallet.update({
    where: { userId },
    data: {
      balance: { decrement: amount },
    },
  });

  // Create withdrawal
  const withdrawal = await prisma.withdrawalRequest.create({
    data: {
      userId,
      amount,
      reason,
      method,
      metadata,
      status: "PENDING",
    },
  });

  return withdrawal;
};

export const updateWithdrawalStatusService = async (id: string, status: "APPROVED" | "REJECTED") => {
  const withdrawal = await prisma.withdrawalRequest.findUnique({ where: { id } });

  if (!withdrawal) throw new Error("Withdrawal not found");
  if (withdrawal.status !== "PENDING") throw new Error("Withdrawal already processed");

  if (status === "REJECTED") {
    await prisma.wallet.update({
      where: { userId: withdrawal.userId },
      data: {
        balance: { increment: withdrawal.amount },
      },
    });
  }

  const updated = await prisma.withdrawalRequest.update({
    where: { id },
    data: { status },
  });

  return updated;
};

export const getUserWithdrawalsService = async (userId: string) => {
  return await prisma.withdrawalRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllWithdrawalsService = async () => {
  return await prisma.withdrawalRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });
};
