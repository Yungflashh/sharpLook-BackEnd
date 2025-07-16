"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.verifyOtp = exports.sendOtp = exports.reset = exports.requestReset = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_service_2 = require("../services/auth.service");
const otp_service_1 = require("../services/otp.service");
const auth_service_3 = require("../services/auth.service");
const prisma_1 = __importDefault(require("../config/prisma"));
const register = async (req, res) => {
    const { firstName, lastName, email, password, role, acceptedPersonalData, phone } = req.body;
    console.log("➡️ Register attempt:", { email, role });
    try {
        const user = await (0, auth_service_1.registerUser)(email, password, firstName, lastName, role, acceptedPersonalData, phone);
        console.log("✅ User registered:", user.id);
        await (0, otp_service_1.sendOtpService)(email);
        console.log("📨 OTP sent to email after registration");
        return res.status(201).json({
            success: true,
            message: "User registered successfully. OTP sent to email.",
            data: user,
        });
    }
    catch (err) {
        console.error("❌ Registration failed:", err.message);
        return res.status(400).json({
            success: false,
            message: "Registration failed",
            error: err.message,
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("➡️ Login attempt:", email);
    try {
        const userCheck = await prisma_1.default.user.findUnique({ where: { email } });
        if (!userCheck) {
            return res.status(401).json({
                success: false,
                message: "Invalid login credentials",
            });
        }
        let responseData;
        if (userCheck.role === "VENDOR") {
            responseData = await (0, auth_service_2.loginWithVendorCheck)(email, password);
        }
        //  else if (userCheck.role === "CLIENT") {
        //   responseData = await loginWithClientCheck(email, password);
        // } 
        else {
            responseData = await (0, auth_service_2.loginUser)(email, password);
        }
        const { token, user, vendorProfile = null, // optional chaining support
        message, } = responseData;
        if (!user.isEmailVerified) {
            await (0, otp_service_1.sendOtpService)(email);
            return res.status(403).json({
                success: false,
                message: "Email not verified. An OTP has been sent to your email.",
            });
        }
        if (message) {
            return res.status(403).json({
                success: false,
                token,
                message,
            });
        }
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user,
            ...(vendorProfile && { vendorProfile }),
        });
    }
    catch (err) {
        console.error("❌ Login failed:", err.message);
        return res.status(401).json({
            success: false,
            message: "Login failed",
            error: err.message,
        });
    }
};
exports.login = login;
const requestReset = async (req, res) => {
    const { email } = req.body;
    console.log("➡️ Password reset requested for:", email);
    try {
        await (0, auth_service_1.requestPasswordReset)(email);
        console.log("📨 Reset token sent to:", email);
        return res.status(200).json({
            success: true,
            message: "Reset token sent to your email",
        });
    }
    catch (err) {
        console.error("❌ Password reset request failed:", err.message);
        return res.status(400).json({
            success: false,
            message: "Failed to send reset token",
            error: err.message,
        });
    }
};
exports.requestReset = requestReset;
const reset = async (req, res) => {
    const { email, newPassword } = req.body;
    const { token } = req.params;
    console.log("➡️ Password reset attempt:", { email, token });
    try {
        await (0, auth_service_1.resetPassword)(email, token, newPassword);
        console.log("✅ Password reset successful");
        return res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    }
    catch (err) {
        console.error("❌ Password reset failed:", err.message);
        return res.status(400).json({
            success: false,
            message: "Password reset failed",
            error: err.message,
        });
    }
};
exports.reset = reset;
const sendOtp = async (req, res) => {
    const { email } = req.body;
    console.log("➡️ Sending OTP to:", email);
    try {
        await (0, otp_service_1.sendOtpService)(email);
        console.log("✅ OTP sent successfully");
        return res.status(200).json({
            success: true,
            message: "OTP sent to email",
        });
    }
    catch (err) {
        console.error("❌ Failed to send OTP:", err.message);
        return res.status(400).json({
            success: false,
            message: "Failed to send OTP",
            error: err.message,
        });
    }
};
exports.sendOtp = sendOtp;
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    console.log("➡️ Verifying OTP:", { email, otp });
    try {
        await (0, otp_service_1.verifyOtpService)(email, otp);
        console.log("✅ OTP verified successfully");
        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
        });
    }
    catch (err) {
        console.error("❌ OTP verification failed:", err.message);
        return res.status(400).json({
            success: false,
            message: "Invalid or expired OTP",
            error: err.message,
        });
    }
};
exports.verifyOtp = verifyOtp;
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await (0, auth_service_3.getUserById)(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ success: true, user });
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};
exports.getCurrentUser = getCurrentUser;
