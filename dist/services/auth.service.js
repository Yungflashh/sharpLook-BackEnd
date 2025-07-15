"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPasswordReset = exports.resetPassword = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const crypto_1 = __importDefault(require("crypto"));
const email_helper_1 = require("../helpers/email.helper");
const registerUser = async (email, password, firstName, lastName, role, acceptedPersonalData, phone) => {
    const existing = await prisma_1.default.user.findUnique({ where: { email } });
    if (existing)
        throw new Error("Email already in use");
    const hash = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.default.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hash,
            role,
            acceptedPersonalData,
            phone
        }
    });
    return user;
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new Error("Invalid credentials");
    const match = await bcryptjs_1.default.compare(password, user.password);
    if (!match)
        throw new Error("Invalid credentials");
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
    return { token, user };
};
exports.loginUser = loginUser;
const resetPassword = async (email, token, newPassword) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user || user.resetToken !== token || user.resetTokenExp < new Date()) {
        throw new Error("Invalid or expired token");
    }
    const hashed = await bcryptjs_1.default.hash(newPassword, 10);
    await prisma_1.default.user.update({
        where: { email },
        data: {
            password: hashed,
            resetToken: null,
            resetTokenExp: null,
        },
    });
};
exports.resetPassword = resetPassword;
const requestPasswordReset = async (email) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new Error("User not found");
    const token = crypto_1.default.randomBytes(32).toString("hex");
    const tokenExp = new Date(Date.now() + 1000 * 60 * 10);
    await prisma_1.default.user.update({
        where: { email },
        data: { resetToken: token, resetTokenExp: tokenExp },
    });
    await (0, email_helper_1.sendMail)(email, "Password Reset Token", `<p>Use this token to reset your password: <b>${token}</b></p>`);
};
exports.requestPasswordReset = requestPasswordReset;
