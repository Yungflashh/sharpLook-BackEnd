"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmPaystackPayment = exports.initiatePaystackPayment = exports.handlePaystackWebhook = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const paystack_1 = require("../utils/paystack");
const wallet_service_1 = require("../services/wallet.service");
const client_1 = require("@prisma/client");
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
const initiatePaystackPayment = async (userId, amount, paymentFor, // e.g. "BOOKING", "ORDER"
description = "Paystack Payment") => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
    });
    if (!user || !user.wallet)
        throw new Error("User or wallet not found");
    const paymentData = await (0, paystack_1.initializePayment)(user.email, amount);
    const reference = paymentData.reference;
    await prisma_1.default.transaction.create({
        data: {
            walletId: user.wallet.id,
            amount,
            reference,
            description,
            status: "pending",
            type: client_1.TransactionType.DEBIT,
            paymentFor,
        },
    });
    return paymentData; // send authorization_url to frontend
};
exports.initiatePaystackPayment = initiatePaystackPayment;
const confirmPaystackPayment = async (reference) => {
    const verification = await (0, paystack_1.verifyPayment)(reference);
    const status = verification.status === "success" ? "paid" : "failed";
    const updatedTransaction = await prisma_1.default.transaction.update({
        where: { reference },
        data: {
            status,
        },
    });
    return updatedTransaction;
};
exports.confirmPaystackPayment = confirmPaystackPayment;
