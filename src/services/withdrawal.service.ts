import prisma from "../config/prisma";

import {
  createTransferRecipient,
  sendTransfer,
} from "../utils/paystack"
import { WithdrawalStatus } from "@prisma/client";
import axios from "axios";



const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
interface WithdrawalRequestInput {
  userId: string;
  amount: number;
  reason?: string;
  bankAccountNumber: string;
  bankCode: string;
  accountName?: string; 
  resolvedAccountName: string
}

export class WithdrawalService {
  static async requestWithdrawal(input: WithdrawalRequestInput) {
    const {
      userId,
      amount,
      reason = "Wallet Withdrawal",
      bankAccountNumber,
      bankCode,
      resolvedAccountName,
    } = input;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance < amount) {
      throw new Error("Insufficient wallet balance");
    }

    // Step 1: Resolve bank account
    // Example: Resolve account
 


    // const resolvedAccountName = accountName ?? resolved.account_name;

    // Step 2: Create recipient
    const recipientCode = await createTransferRecipient(
      resolvedAccountName,
      bankAccountNumber,
      bankCode
    );

    // Step 3: Lock funds
    await prisma.wallet.update({
      where: { userId },
      data: {
        balance: { decrement: amount },
      },
    });

    // Step 4: Send transfer
    const transfer = await sendTransfer(
      amount,
      recipientCode,
      reason,
      { userId }
    );

    // Step 5: Store withdrawal record
    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        userId,
        amount,
        reason,
        method: "paystack",
        status: transfer.status === "success" ? WithdrawalStatus.PAID : WithdrawalStatus.PENDING,
        metadata: transfer,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      message: transfer.status === "success" ? "Withdrawal successful" : "Withdrawal processing",
      withdrawal,
      paystackReference: transfer.reference,
      transferStatus: transfer.status,
    };
  }
}








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


export const resolveAccount = async (accountNumber: string, bankCode: string) => {
  try {
    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    if (!response.data.status) {
      throw new Error(response.data.message || "Failed to resolve account");
    }

    // This returns something like { account_name: "John Doe", account_number: "1234567890" }
    return response.data.data;
  } catch (error: any) {
    console.error("Paystack resolve account error:", error.response?.data || error.message);
    throw new Error("Failed to resolve bank account. Please verify the details.");
  }
};