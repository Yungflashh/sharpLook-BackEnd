"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletTransactions = exports.getWalletDetails = void 0;
const wallet_service_1 = require("../services/wallet.service");
const getWalletDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const wallet = await (0, wallet_service_1.getUserWallet)(userId);
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" });
        }
        return res.status(200).json({ success: true, wallet });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};
exports.getWalletDetails = getWalletDetails;
const walletTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await (0, wallet_service_1.getWalletTransactions)(userId);
        res.status(200).json(transactions);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "An Error occured" });
    }
};
exports.walletTransactions = walletTransactions;
