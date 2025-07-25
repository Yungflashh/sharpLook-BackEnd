"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllWithdrawalsService = exports.getUserWithdrawalsService = exports.updateWithdrawalStatusService = exports.requestWithdrawalService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
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
