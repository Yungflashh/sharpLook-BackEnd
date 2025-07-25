"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllWithdrawals = exports.getUserWithdrawals = exports.updateWithdrawalStatus = exports.requestWithdrawal = void 0;
const withdrawal_service_1 = require("../services/withdrawal.service");
const requestWithdrawal = async (req, res, next) => {
    try {
        const { amount, reason, method, metadata } = req.body;
        const userId = req.user.id;
        const withdrawal = await (0, withdrawal_service_1.requestWithdrawalService)(userId, amount, reason, method, metadata);
        res.status(201).json({
            success: true,
            message: "Withdrawal request submitted",
            data: withdrawal,
        });
    }
    catch (err) {
        // Handle specific error manually
        if (err.message === "Insufficient wallet balance") {
            return res.status(400).json({
                success: false,
                message: "Insufficient wallet balance",
            });
        }
        // For other errors
        console.error("Withdrawal error:", err);
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};
exports.requestWithdrawal = requestWithdrawal;
const updateWithdrawalStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await (0, withdrawal_service_1.updateWithdrawalStatusService)(id, status);
        res.status(200).json({ success: true, message: `Withdrawal ${status.toLowerCase()}`, data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.updateWithdrawalStatus = updateWithdrawalStatus;
const getUserWithdrawals = async (req, res, next) => {
    try {
        const withdrawals = await (0, withdrawal_service_1.getUserWithdrawalsService)(req.user.id);
        res.status(200).json({ success: true, data: withdrawals });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserWithdrawals = getUserWithdrawals;
const getAllWithdrawals = async (req, res, next) => {
    try {
        const all = await (0, withdrawal_service_1.getAllWithdrawalsService)();
        res.status(200).json({ success: true, data: all });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllWithdrawals = getAllWithdrawals;
