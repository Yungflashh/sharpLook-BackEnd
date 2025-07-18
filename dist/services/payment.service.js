"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePaystackWebhook = void 0;
const wallet_service_1 = require("./wallet.service");
const paystack_1 = require("../utils/paystack");
const prisma_1 = __importDefault(require("../config/prisma"));
const handlePaystackWebhook = async (reference) => {
    const result = await (0, paystack_1.verifyPayment)(reference);
    const paymentData = result.data;
    const email = paymentData.customer.email;
    const amount = paymentData.amount / 100;
    const user = await prisma_1.default.user.findUnique({ where: { email }, include: { wallet: true } });
    if (!user || !user.wallet)
        throw new Error("User or wallet not found");
    // Avoid duplicate funding
    const alreadyFunded = await prisma_1.default.transaction.findFirst({
        where: { reference },
    });
    if (alreadyFunded)
        return "Already funded";
    // Credit wallet
    await (0, wallet_service_1.creditWallet)(user.wallet.id, amount, "Wallet Funding");
    // Save reference in transaction
    await prisma_1.default.transaction.updateMany({
        where: { walletId: user.wallet.id, description: "Wallet Funding", reference },
        data: { reference },
    });
    return "Wallet funded successfully";
};
exports.handlePaystackWebhook = handlePaystackWebhook;
