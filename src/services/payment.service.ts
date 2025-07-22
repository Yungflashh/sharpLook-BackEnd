import prisma from "../config/prisma"
import { verifyPayment } from "../utils/paystack"
import { creditWallet } from "../services/wallet.service"

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

