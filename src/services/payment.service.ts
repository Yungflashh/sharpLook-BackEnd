import prisma from "../config/prisma";
import { verifyPayment, initializePayment } from "../utils/paystack";
import { creditWallet } from "../services/wallet.service";
import { TransactionType } from "@prisma/client";

export const handlePaystackWebhook = async (reference: string) => {
  const paymentData = await verifyPayment(reference);
  const email = paymentData.customer?.email;
  const amount = paymentData.amount / 100;

  if (!email) throw new Error("Email missing from payment");

  const user = await prisma.user.findUnique({
    where: { email },
    include: { wallet: true },
  });

  if (!user?.wallet) throw new Error("User or wallet not found");

  const transaction = await prisma.transaction.findUnique({
    where: { reference },
  });

  if (!transaction) {
    console.error(`[Webhook] No transaction found for ${reference}`);
    return;
  }

  if (transaction.status === "SUCCESS") {
    console.warn(`[Webhook] Transaction already processed: ${reference}`);
    return;
  }

  // ✅ Credit wallet and mark transaction as successful
  await creditWallet(user.wallet.id, amount, "Wallet Funding");

  await prisma.transaction.update({
    where: { reference },
    data: { status: "SUCCESS" },
  });

  console.log(`[Webhook] Wallet funded successfully: ${amount}`);
};

export const initiatePaystackPayment = async (
  userId: string,
  amount: number,
  paymentFor: string, // e.g. "BOOKING", "ORDER"
  description = "Paystack Payment"
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });

  if (!user || !user.wallet) throw new Error("User or wallet not found");

  const paymentData = await initializePayment(user.email, amount);
  const reference = paymentData.reference;

  await prisma.transaction.create({
    data: {
      walletId: user.wallet.id,
      amount,
      reference,
      description,
      status: "pending",
      type: TransactionType.DEBIT,
      paymentFor,
    },
  });

  return paymentData; // send authorization_url to frontend
};

export const confirmPaystackPayment = async (reference: string) => {
  const verification = await verifyPayment(reference);

  const status = verification.status === "success" ? "paid" : "failed";

  const updatedTransaction = await prisma.transaction.update({
    where: { reference },
    data: {
      status,
    },
  });

  return updatedTransaction;
};
