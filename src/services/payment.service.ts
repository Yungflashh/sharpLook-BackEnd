import prisma from "../config/prisma";
import { verifyPayment, initializePayment } from "../utils/paystack";
import { creditWallet } from "../services/wallet.service";
import { TransactionType } from "@prisma/client";

export const handlePaystackWebhook = async (reference: string) => {


  try {
    const paymentData = await verifyPayment(reference);
    const email = paymentData.customer?.email;
    const amount = paymentData.amount / 100;

           console.log("Na transaction be this  ********************", paymentData);


    if (!email) {
      throw new Error("Email missing from payment");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    });

    if (!user?.wallet) {
      throw new Error("User or wallet not found");
    }

    const transaction = await prisma.transaction.findUnique({
      where: { reference },
    });

    if (!transaction) {
      const message = `[Webhook] No transaction found for ${reference}`;
      console.error(message);
      return { success: false, message };
    }

    if (paymentData.status !== "success"){
      const message = `${paymentData.gateway_response}`;
      console.warn(message);
      return  { success: false, message };

    }
    
    if (transaction.status === "paid") {
      const message = `Payment has already been verified , The refrence number is : ${reference}`;
      console.warn(message);
      return { success: true, status: 200,  message };
    }


    // ✅ Credit wallet and mark transaction as successful
    await creditWallet(user.wallet.id, amount, "Wallet Funding");

    await prisma.transaction.update({
      where: { reference },
      data: { status: "SUCCESS" },
    });

    const message = `[Webhook] Wallet funded successfully: ${amount}`;
    // console.log(message);
    return { success: true, status: 200, message };
    
  } catch (error: any) {
    console.error(`[Webhook Error]`, error);
    return {
      success: false,
      message: error.message || "Unhandled error occurred",
    };
  }
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

  console.log(typeof amount, "here");
  

  if (!user || !user.wallet) throw new Error("User or wallet not found");

  const paymentData = await initializePayment(user.email, amount);

  console.log("This is Payment Data", paymentData );
  
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
