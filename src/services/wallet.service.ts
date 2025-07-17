import prisma from "../config/prisma"

// Create a new wallet without needing userId
export const createWallet = async (userId: string) => {
  return await prisma.wallet.create({
    data: {
      balance: 0,
      status: "ACTIVE",
      likes: {
        create: [],
      },
      user: {
        connect: { id: userId },
      },
    },
  });
};


// Credit (add money) to wallet, and log a CREDIT transaction
export const creditWallet = async (
  walletId: string,
  amount: number,
  description = "Referral Bonus"
) => {
  return await prisma.wallet.update({
    where: { id: walletId },
    data: {
      balance: { increment: amount },
      transactions: {
        create: {
          amount,
          type: "CREDIT",
          description,
        },
      },
    },
  })
}

// Debit (remove money) from wallet, and log a DEBIT transaction
export const debitWallet = async (
  walletId: string,
  amount: number,
  description = "Debit"
) => {
  return await prisma.wallet.update({
    where: { id: walletId },
    data: {
      balance: { decrement: amount },
      transactions: {
        create: {
          amount,
          type: "DEBIT",
          description,
        },
      },
    },
  })
}

// Get wallet and transactions for a user
export const getUserWallet = async (userId: string) => {
  return await prisma.wallet.findUnique({
    where: { userId },
    include: { transactions: true },
  })
}

export const getWalletTransactions = async (userId: string) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { id: true }
  });

  if (!wallet) return [];

  return await prisma.transaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: "desc" },
  });
};