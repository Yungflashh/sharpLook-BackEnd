"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWalletFunding = exports.fundWallet = exports.walletTransactions = exports.getWalletDetails = void 0;
const wallet_service_1 = require("../services/wallet.service");
const payment_service_1 = require("../services/payment.service");
// import { initializePayment  } from "../utils/paystack"
const getWalletDetails = async (req, res) => {
    try {
        // 1. Extract user ID
        const userId = req.user.id;
        // 2. Fetch wallet by user ID
        const wallet = await (0, wallet_service_1.getUserWallet)(userId);
        // 3. Handle wallet not found
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }
        // 4. Return wallet info
        return res.status(200).json({ success: true, wallet });
    }
    catch (error) {
        // 5. Handle unexpected error
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};
exports.getWalletDetails = getWalletDetails;
const walletTransactions = async (req, res) => {
    try {
        // 1. Extract user ID
        const userId = req.user.id;
        // 2. Fetch transactions from DB
        const transactions = await (0, wallet_service_1.getWalletTransactions)(userId);
        // 3. Return transaction list
        res.status(200).json(transactions);
    }
    catch (error) {
        // 4. Handle unexpected error
        console.log(error);
        res.status(500).json({ message: "An Error occurred" });
    }
};
exports.walletTransactions = walletTransactions;
const fundWallet = async (req, res) => {
    const userId = req.user.id;
    try {
        const { email, amount } = req.body;
        const paymentFor = "WALLET FUNDING";
        console.log(typeof amount);
        const payment = await (0, payment_service_1.initiatePaystackPayment)(userId, amount, paymentFor);
        console.log(payment);
        res.status(200).json({ message: "Initialized", data: payment });
    }
    catch (error) {
        const err = error;
        res.status(400).json({ error: err.message });
    }
};
exports.fundWallet = fundWallet;
const verifyWalletFunding = async (req, res) => {
    try {
        const { reference } = req.body;
        console.log("[verifyWalletFunding] Incoming request - Body:", req.body);
        if (!reference || typeof reference !== "string") {
            const message = "Missing or invalid reference";
            console.error("[verifyWalletFunding] Error:", message);
            return res.status(400).json({ error: message });
        }
        const result = await (0, payment_service_1.handlePaystackWebhook)(reference);
        if (result.success == false) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }
        res.status(200).json({ message: result });
    }
    catch (error) {
        const err = error;
        console.error("[verifyWalletFunding] Error occurred:", err.message);
        // Add more structured error details for debugging
        res.status(400).json({
            error: "Funding failed",
            details: err.message,
            message: "verifyWalletFunding",
        });
    }
};
exports.verifyWalletFunding = verifyWalletFunding;
