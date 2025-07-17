"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletTransactions = exports.getWalletDetails = void 0;
const wallet_service_1 = require("../services/wallet.service");
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
