import { creditWallet } from "./wallet.service"
import { verifyPayment } from "../utils/paystack"
import prisma from "../config/prisma"

export const handlePaystackWebhook = async (reference: string) => {
  const result = await verifyPayment(reference)
  const paymentData = result.data

  const email = paymentData.customer.email
  const amount = paymentData.amount / 100

  const user = await prisma.user.findUnique({ where: { email }, include: { wallet: true } })

  if (!user || !user.wallet) throw new Error("User or wallet not found")

  // Avoid duplicate funding
  const alreadyFunded = await prisma.transaction.findFirst({
    where: { reference },
  })
  if (alreadyFunded) return "Already funded"

  // Credit wallet
  await creditWallet(user.wallet.id, amount, "Wallet Funding")

  // Save reference in transaction
  await prisma.transaction.updateMany({
    where: { walletId: user.wallet.id, description: "Wallet Funding", reference },
    data: { reference },
  })

  return "Wallet funded successfully"
}
