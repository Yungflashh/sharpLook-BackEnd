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
    const paymentData = await (0, paystack_1.verifyPayment)(reference);
    const email = paymentData.customer?.email;
    const amount = paymentData.amount / 100;
    if (!email)
        throw new Error("Email missing from payment");
    const user = await prisma_1.default.user.findUnique({
        where: { email },
        include: { wallet: true },
    });
    if (!user?.wallet)
        throw new Error("User or wallet not found");
    const transaction = await prisma_1.default.transaction.findUnique({
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
    await (0, wallet_service_1.creditWallet)(user.wallet.id, amount, "Wallet Funding");
    await prisma_1.default.transaction.update({
        where: { reference },
        data: { status: "SUCCESS" },
    });
    console.log(`[Webhook] Wallet funded successfully: ${amount}`);
};
exports.handlePaystackWebhook = handlePaystackWebhook;
