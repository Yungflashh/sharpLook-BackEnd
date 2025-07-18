"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.initializePayment = void 0;
const axios_1 = __importDefault(require("axios"));
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const initializePayment = async (email, amount) => {
    const response = await axios_1.default.post("https://api.paystack.co/transaction/initialize", {
        email,
        amount: amount * 100,
    }, {
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`,
            "Content-Type": "application/json",
        },
    });
    return response.data;
};
exports.initializePayment = initializePayment;
const verifyPayment = async (reference) => {
    const response = await axios_1.default.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
    });
    return response.data;
};
exports.verifyPayment = verifyPayment;
