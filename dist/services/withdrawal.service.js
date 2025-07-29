"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAccount = exports.getAllWithdrawalsService = exports.getUserWithdrawalsService = exports.updateWithdrawalStatusService = exports.requestWithdrawalService = exports.WithdrawalService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const paystack_1 = require("../utils/paystack");
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
class WithdrawalService {
    static async requestWithdrawal(input) {
        const { userId, amount, reason = "Wallet Withdrawal", bankAccountNumber, bankCode, resolvedAccountName, } = input;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error("User not found");
        const wallet = await prisma_1.default.wallet.findUnique({ where: { userId } });
        if (!wallet || wallet.balance < amount) {
            throw new Error("Insufficient wallet balance");
        }
        // Step 1: Resolve bank account
        // Example: Resolve account
        // const resolvedAccountName = accountName ?? resolved.account_name;
        // Step 2: Create recipient
        const recipientCode = await (0, paystack_1.createTransferRecipient)(resolvedAccountName, bankAccountNumber, bankCode);
        // Step 3: Lock funds
        await prisma_1.default.wallet.update({
            where: { userId },
            data: {
                balance: { decrement: amount },
            },
        });
        // Step 4: Send transfer
        const transfer = await (0, paystack_1.sendTransfer)(amount, recipientCode, reason, { userId });
        // Step 5: Store withdrawal record
        const withdrawal = await prisma_1.default.withdrawalRequest.create({
            data: {
                userId,
                amount,
                reason,
                method: "paystack",
                status: transfer.status === "success" ? client_1.WithdrawalStatus.PAID : client_1.WithdrawalStatus.PENDING,
                metadata: transfer,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        return {
            message: transfer.status === "success" ? "Withdrawal successful" : "Withdrawal processing",
            withdrawal,
            paystackReference: transfer.reference,
            transferStatus: transfer.status,
        };
    }
}
exports.WithdrawalService = WithdrawalService;
const requestWithdrawalService = async (userId, amount, reason, method, metadata) => {
    const wallet = await prisma_1.default.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance < amount) {
        throw new Error("Insufficient wallet balance");
    }
    // Lock funds
    await prisma_1.default.wallet.update({
        where: { userId },
        data: {
            balance: { decrement: amount },
        },
    });
    // Create withdrawal
    const withdrawal = await prisma_1.default.withdrawalRequest.create({
        data: {
            userId,
            amount,
            reason,
            method,
            metadata,
            status: "PENDING",
        },
    });
    return withdrawal;
};
exports.requestWithdrawalService = requestWithdrawalService;
const updateWithdrawalStatusService = async (id, status) => {
    const withdrawal = await prisma_1.default.withdrawalRequest.findUnique({ where: { id } });
    if (!withdrawal)
        throw new Error("Withdrawal not found");
    if (withdrawal.status !== "PENDING")
        throw new Error("Withdrawal already processed");
    if (status === "REJECTED") {
        await prisma_1.default.wallet.update({
            where: { userId: withdrawal.userId },
            data: {
                balance: { increment: withdrawal.amount },
            },
        });
    }
    const updated = await prisma_1.default.withdrawalRequest.update({
        where: { id },
        data: { status },
    });
    return updated;
};
exports.updateWithdrawalStatusService = updateWithdrawalStatusService;
const getUserWithdrawalsService = async (userId) => {
    return await prisma_1.default.withdrawalRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
};
exports.getUserWithdrawalsService = getUserWithdrawalsService;
const getAllWithdrawalsService = async () => {
    return await prisma_1.default.withdrawalRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: true },
    });
};
exports.getAllWithdrawalsService = getAllWithdrawalsService;
const resolveAccount = async (accountNumber, bankCode) => {
    try {
        const response = await axios_1.default.get(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
            },
        });
        if (!response.data.status) {
            throw new Error(response.data.message || "Failed to resolve account");
        }
        // This returns something like { account_name: "John Doe", account_number: "1234567890" }
        return response.data.data;
    }
    catch (error) {
        console.error("Paystack resolve account error:", error.response?.data || error.message);
        throw new Error("Failed to resolve bank account. Please verify the details.");
    }
};
exports.resolveAccount = resolveAccount;
