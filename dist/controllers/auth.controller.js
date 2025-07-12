"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.sendOtp = exports.reset = exports.requestReset = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const otp_service_1 = require("../services/otp.service");
const register = async (req, res) => {
    const { email, password, role, acceptedPersonalData } = req.body;
    try {
        const user = await (0, auth_service_1.registerUser)(email, password, role, acceptedPersonalData);
        res.status(201).json({
            success: true,
            message: "User registered successfully. OTP sent to email.",
            data: user
        });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { token, user } = await (0, auth_service_1.loginUser)(email, password);
        if (!user.isEmailVerified) {
            await (0, otp_service_1.sendOtpService)(email);
            return res.status(403).json({
                error: "Email not verified. An Otp Code has been sent to Your email.",
            });
        }
        res.status(200).json({ token, user });
    }
    catch (err) {
        res.status(401).json({ error: err.message });
    }
};
exports.login = login;
const requestReset = async (req, res) => {
    try {
        await (0, auth_service_1.requestPasswordReset)(req.body.email);
        res.json({ message: "Reset token sent to your email" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.requestReset = requestReset;
const reset = async (req, res) => {
    const { email, token, newPassword } = req.body;
    try {
        await (0, auth_service_1.resetPassword)(email, token, newPassword);
        res.json({ message: "Password reset successful" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.reset = reset;
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        await (0, otp_service_1.sendOtpService)(email);
        res.json({ message: "OTP sent to email (simulated)" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.sendOtp = sendOtp;
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        await (0, otp_service_1.verifyOtpService)(email, otp);
        res.json({ message: "OTP verified successfully" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.verifyOtp = verifyOtp;
