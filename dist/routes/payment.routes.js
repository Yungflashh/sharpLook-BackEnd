"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controlelr_1 = require("../controllers/payment.controlelr");
const router = express_1.default.Router();
router.post("/paystack/initiate", payment_controlelr_1.createPaystackPayment);
router.get("/paystack/verify/:reference", payment_controlelr_1.verifyPaystackPayment);
exports.default = router;
