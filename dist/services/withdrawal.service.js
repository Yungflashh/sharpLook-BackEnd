"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAccount = exports.getAllWithdrawalsService = exports.getUserWithdrawalsService = exports.updateWithdrawalStatusService = exports.requestWithdrawalService = exports.WithdrawalService = exports.generateReferralReference = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const paystack_1 = require("../utils/paystack");
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const wallet_service_1 = require("./wallet.service");
const generateReferralReference = () => {
    // Example: REF-20250801-8F4C2A7B (prefix + date + random hex)
    const prefix = "REF";
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // e.g., 20250801
    const randomPart = Math.random().toString(16).substr(2, 8).toUpperCase();
    return `${prefix}-${datePart}-${randomPart}`;
};
exports.generateReferralReference = generateReferralReference;
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
        console.log("wallet dey here", wallet);
        // Fetch Vendor Commission Setting
        const vendorCommission = await prisma_1.default.vendorCommissionSetting.findUnique({
            where: { userId },
        });
        let platformFee = 0;
        if (vendorCommission) {
            const now = new Date();
            const onboardingDate = user.createdAt; // Assuming createdAt is the onboarding date
            const timeElapsed = now.getTime() - onboardingDate.getTime();
            let shouldDeductCommission = false;
            switch (vendorCommission.deductionStart) {
                case "AFTER_FIRST_WEEK":
                    shouldDeductCommission = timeElapsed >= 7 * 24 * 60 * 60 * 1000;
                    break;
                case "AFTER_SECOND_WEEK":
                    shouldDeductCommission = timeElapsed >= 14 * 24 * 60 * 60 * 1000;
                    break;
                case "AFTER_FIRST_MONTH":
                    shouldDeductCommission = timeElapsed >= 30 * 24 * 60 * 60 * 1000;
                    break;
            }
            if (shouldDeductCommission) {
                platformFee = amount * vendorCommission.commissionRate;
            }
        }
        const payoutAmount = amount - platformFee;
        if (payoutAmount <= 0) {
            throw new Error("Payout amount is too low after deducting platform fee.");
        }
        // Step 1: Create recipient
        // Step 1: Create recipient
        const recipientCode = await (0, paystack_1.createTransferRecipient)(resolvedAccountName, bankAccountNumber, bankCode);
        try {
            await (0, wallet_service_1.debitWallet)(wallet.id, payoutAmount, "Wallet Withdrawal", (0, exports.generateReferralReference)());
        }
        catch (error) {
            console.error("Failed to debit wallet:", error);
            throw error;
        }
        // Step 3: Initiate Transfer for payoutAmount
        const transfer = await (0, paystack_1.sendTransfer)(payoutAmount, recipientCode, reason, { userId });
        // Step 4: Store Withdrawal Record
        const withdrawal = await prisma_1.default.withdrawalRequest.create({
            data: {
                userId,
                amount: payoutAmount,
                reason,
                method: "paystack",
                status: transfer.status === "success" ? client_1.WithdrawalStatus.PAID : client_1.WithdrawalStatus.PENDING,
                metadata: {
                    originalAmount: amount,
                    platformFee,
                    transferDetails: transfer,
                },
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
