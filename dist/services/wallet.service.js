"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletTransactions = exports.getUserWallet = exports.debitWallet = exports.creditWallet = exports.createWallet = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
// Create a new wallet without needing userId
const createWallet = async (userId) => {
    return await prisma_1.default.wallet.create({
        data: {
            balance: 0,
            status: "ACTIVE",
            likes: {
                create: [],
            },
            user: {
                connect: { id: userId },
            },
        },
    });
};
exports.createWallet = createWallet;
// Credit (add money) to wallet, and log a CREDIT transaction
const creditWallet = async (walletId, amount, description = "Referral Bonus") => {
    return await prisma_1.default.wallet.update({
        where: { id: walletId },
        data: {
            balance: { increment: amount },
            transactions: {
                create: {
                    amount,
                    type: "CREDIT",
                    description,
                },
            },
        },
    });
};
exports.creditWallet = creditWallet;
// Debit (remove money) from wallet, and log a DEBIT transaction
const debitWallet = async (walletId, amount, description = "Debit") => {
    return await prisma_1.default.wallet.update({
        where: { id: walletId },
        data: {
            balance: { decrement: amount },
            transactions: {
                create: {
                    amount,
                    type: "DEBIT",
                    description,
                },
            },
        },
    });
};
exports.debitWallet = debitWallet;
// Get wallet and transactions for a user
const getUserWallet = async (userId) => {
    return await prisma_1.default.wallet.findUnique({
        where: { userId },
        include: { transactions: true },
    });
};
exports.getUserWallet = getUserWallet;
const getWalletTransactions = async (userId) => {
    const wallet = await prisma_1.default.wallet.findUnique({
        where: { userId },
        select: { id: true }
    });
    if (!wallet)
        return [];
    return await prisma_1.default.transaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
    });
};
exports.getWalletTransactions = getWalletTransactions;
