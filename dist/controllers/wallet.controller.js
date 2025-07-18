"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWalletFunding = exports.fundWallet = exports.walletTransactions = exports.getWalletDetails = void 0;
const wallet_service_1 = require("../services/wallet.service");
const payment_service_1 = require("../services/payment.service");
const paystack_1 = require("../utils/paystack");
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
    try {
        const { email, amount } = req.body;
        const payment = await (0, paystack_1.initializePayment)(email, amount);
        res.status(200).json({ message: "Initialized", data: payment.data });
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
        if (!reference || typeof reference !== "string") {
            return res.status(400).json({ error: "Missing or invalid reference" });
        }
        const result = await (0, payment_service_1.handlePaystackWebhook)(reference);
        res.status(200).json({ message: result });
    }
    catch (error) {
        const err = error;
        res.status(400).json({ error: err.message });
    }
};
exports.verifyWalletFunding = verifyWalletFunding;
