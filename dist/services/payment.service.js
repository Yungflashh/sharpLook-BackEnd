"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePaystackWebhook = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const paystack_1 = require("../utils/paystack");
const wallet_service_1 = require("../services/wallet.service");
const handlePaystackWebhook = async (reference) => {
    console.log("[handlePaystackWebhook] Start - Reference:", reference);
    const result = await (0, paystack_1.verifyPayment)(reference);
    const paymentData = result.data;
    console.log("[handlePaystackWebhook] Payment verified:", paymentData);
    const email = paymentData.customer?.email;
    const amount = paymentData.amount / 100;
    if (!email) {
        throw new Error("[handlePaystackWebhook] No email found in payment data");
    }
    const user = await prisma_1.default.user.findUnique({
        where: { email },
        include: { wallet: true },
    });
    if (!user) {
        throw new Error(`[handlePaystackWebhook] User not found for email: ${email}`);
    }
    if (!user.wallet) {
        throw new Error(`[handlePaystackWebhook] Wallet not found for user: ${email}`);
    }
    console.log(`[handlePaystackWebhook] User found: ${user.email}, Wallet ID: ${user.wallet.id}`);
    const alreadyFunded = await prisma_1.default.transaction.findFirst({
        where: { reference },
    });
    if (alreadyFunded) {
        console.warn(`[handlePaystackWebhook] Duplicate transaction detected - Reference: ${reference}`);
        return "Already funded";
    }
    await (0, wallet_service_1.creditWallet)(user.wallet.id, amount, "Wallet Funding");
    console.log(`[handlePaystackWebhook] Wallet credited with amount: ${amount}`);
    await prisma_1.default.transaction.updateMany({
        where: { walletId: user.wallet.id, description: "Wallet Funding", reference },
        data: { reference },
    });
    console.log(`[handlePaystackWebhook] Transaction record updated for reference: ${reference}`);
    return "Wallet funded successfully";
};
exports.handlePaystackWebhook = handlePaystackWebhook;
