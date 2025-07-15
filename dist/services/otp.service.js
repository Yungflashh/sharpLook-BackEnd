"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpService = exports.sendOtpService = void 0;
// src/services/otp.service.ts
const prisma_1 = __importDefault(require("../config/prisma"));
const email_helper_1 = require("../helpers/email.helper");
const sendOtpService = async (identifier) => {
    const user = await prisma_1.default.user.findFirst({
        where: {
            OR: [{ email: identifier }, { phone: identifier }],
        },
    });
    if (!user)
        throw new Error("User not found");
    const fourDigitotp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`✅ OTP Generated: ${fourDigitotp} | Length: ${fourDigitotp.length}`);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: { otp: fourDigitotp, otpExpires },
    });
    if (user.email === identifier) {
        await (0, email_helper_1.sendMail)(user.email, "Your OTP Code", `<p>Your OTP code is: <b>${fourDigitotp}</b>. It expires in 10 minutes.</p>`);
    }
    console.log(`✅ OTP sent to ${identifier}: ${fourDigitotp}`);
};
exports.sendOtpService = sendOtpService;
const verifyOtpService = async (email, otp) => {
    const user = await prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error("User not found");
    }
    if (!user.otp || !user.otpExpires) {
        throw new Error("OTP not found or expired");
    }
    if (user.otp !== otp) {
        throw new Error("Invalid OTP");
    }
    if (user.otpExpires < new Date()) {
        throw new Error("OTP has expired");
    }
    // Mark user as verified and clear OTP
    await prisma_1.default.user.update({
        where: { email },
        data: {
            isEmailVerified: true,
            isOtpVerified: true,
            otp: null,
            otpExpires: null,
        },
    });
};
exports.verifyOtpService = verifyOtpService;
