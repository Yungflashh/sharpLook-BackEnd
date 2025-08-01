import prisma from "../config/prisma";

import {
  createTransferRecipient,
  sendTransfer,
} from "../utils/paystack"
import { WithdrawalStatus } from "@prisma/client";
import axios from "axios";
import { debitWallet } from "./wallet.service";


export const generateReferralReference = (): string => {
  // Example: REF-20250801-8F4C2A7B (prefix + date + random hex)
  const prefix = "REF";
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // e.g., 20250801
  const randomPart = Math.random().toString(16).substr(2, 8).toUpperCase();

  return `${prefix}-${datePart}-${randomPart}`;
};


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


    console.log("wallet dey here", wallet);
    
    // Fetch Vendor Commission Setting
    const vendorCommission = await prisma.vendorCommissionSetting.findUnique({
      where: { userId },
    });

    let platformFee = 0;
    if (vendorCommission) {
      const now = new Date();
      const onboardingDate = user.createdAt; // Assuming createdAt is the onboarding date
      const timeElapsed = now.getTime() - onboardingDate.getTime();

      let shouldDeductCommission = false;

      switch (vendorCommission.deductionStart) {
        case "AFTER_FIRST_WEEK":
          shouldDeductCommission = timeElapsed >= 7 * 24 * 60 * 60 * 1000;
          break;
        case "AFTER_SECOND_WEEK":
          shouldDeductCommission = timeElapsed >= 14 * 24 * 60 * 60 * 1000;
          break;
        case "AFTER_FIRST_MONTH":
          shouldDeductCommission = timeElapsed >= 30 * 24 * 60 * 60 * 1000;
          break;
      }

      if (shouldDeductCommission) {
        platformFee = amount * vendorCommission.commissionRate;
      }
    }

    const payoutAmount = amount - platformFee;

    if (payoutAmount <= 0) {
      throw new Error("Payout amount is too low after deducting platform fee.");
    }

    // Step 1: Create recipient
  // Step 1: Create recipient
const recipientCode = await createTransferRecipient(
  resolvedAccountName,
  bankAccountNumber,
  bankCode,
);
try {
  await debitWallet(wallet.id, amount, "Wallet Withdrawal", generateReferralReference());
} catch (error) {
  console.error("Failed to debit wallet:", error);
  throw error;
}


// Step 3: Initiate Transfer for payoutAmount
const transfer = await sendTransfer(
  payoutAmount,
  recipientCode,
  reason,
  { userId }
);

// Step 4: Store Withdrawal Record
const withdrawal = await prisma.withdrawalRequest.create({
  data: {
    userId,
    amount: payoutAmount,
    reason,
    method: "paystack",
    status: transfer.status === "success" ? WithdrawalStatus.PAID : WithdrawalStatus.PENDING,
    metadata: {
      originalAmount: amount,
      platformFee,
      transferDetails: transfer,
    },
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