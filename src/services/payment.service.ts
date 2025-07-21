import prisma from "../config/prisma"
import { verifyPayment } from "../utils/paystack"
import { creditWallet } from "../services/wallet.service"

export const handlePaystackWebhook = async (reference: string) => {
  console.log("[handlePaystackWebhook] Start - Reference:", reference)

  const result = await verifyPayment(reference)
  const paymentData = result.data
  console.log("[handlePaystackWebhook] Payment verified:", paymentData)

  const email = paymentData.customer?.email
  const amount = paymentData.amount / 100

  if (!email) {
    throw new Error("[handlePaystackWebhook] No email found in payment data")
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { wallet: true },
  })

  if (!user) {
    throw new Error(`[handlePaystackWebhook] User not found for email: ${email}`)
  }

  if (!user.wallet) {
    throw new Error(`[handlePaystackWebhook] Wallet not found for user: ${email}`)
  }

  console.log(`[handlePaystackWebhook] User found: ${user.email}, Wallet ID: ${user.wallet.id}`)

  const alreadyFunded = await prisma.transaction.findFirst({
    where: { reference },
  })

  if (alreadyFunded) {
    console.warn(`[handlePaystackWebhook] Duplicate transaction detected - Reference: ${reference}`)
    return "Already funded"
  }

  await creditWallet(user.wallet.id, amount, "Wallet Funding")
  console.log(`[handlePaystackWebhook] Wallet credited with amount: ${amount}`)

  await prisma.transaction.updateMany({
    where: { walletId: user.wallet.id, description: "Wallet Funding", reference },
    data: { reference },
  })

  console.log(`[handlePaystackWebhook] Transaction record updated for reference: ${reference}`)

  return "Wallet funded successfully"
}
