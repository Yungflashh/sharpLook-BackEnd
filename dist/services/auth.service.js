"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.requestPasswordReset = exports.resetPassword = exports.loginWithVendorCheck = exports.loginWithClientCheck = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const crypto_1 = __importDefault(require("crypto"));
const email_helper_1 = require("../helpers/email.helper");
const referral_1 = require("../utils/referral");
const wallet_service_1 = require("./wallet.service");
// Accept an optional referralCode during registration
const registerUser = async (email, password, firstName, lastName, role, acceptedPersonalData, phone, referredByCode // 👈 New
) => {
    const existing = await prisma_1.default.user.findUnique({ where: { email } });
    if (existing)
        throw new Error("Email already in use");
    const hash = await bcryptjs_1.default.hash(password, 10);
    // Generate a referral code for this new user
    const referralCode = (0, referral_1.generateReferralCode)();
    // Create the user with referralCode and (optional) referredBy
    const user = await prisma_1.default.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hash,
            role,
            acceptedPersonalData,
            phone,
            referralCode,
            referredBy: referredByCode || undefined
        }
    });
    // Create an empty wallet for the user
    const userWallet = await (0, wallet_service_1.createWallet)(user.id);
    // ✅ Credit both referrer and this user if referredByCode is valid
    if (referredByCode) {
        const referrer = await prisma_1.default.user.findFirst({
            where: { referralCode: referredByCode },
            include: { wallet: true }
        });
        if (referrer?.wallet) {
            await (0, wallet_service_1.creditWallet)(referrer.wallet.id, 100);
        }
        if (userWallet) {
            await (0, wallet_service_1.creditWallet)(userWallet.id, 100);
        }
    }
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
        expiresIn: "7d",
    });
    return { token, user };
};
exports.loginUser = loginUser;
const loginWithClientCheck = async (email, password) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new Error("Invalid credentials");
    const match = await bcryptjs_1.default.compare(password, user.password);
    if (!match)
        throw new Error("Invalid credentials");
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    let message;
    if (user.role === "CLIENT") {
        if (user.preferredLatitude == null || user.preferredLongitude == null) {
            message = "Please set your location preference to continue.";
        }
    }
    return { token, user, message };
};
exports.loginWithClientCheck = loginWithClientCheck;
const loginWithVendorCheck = async (email, password) => {
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new Error("Invalid credentials");
    const match = await bcryptjs_1.default.compare(password, user.password);
    if (!match)
        throw new Error("Invalid credentials");
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    let vendorProfile = await prisma_1.default.vendorOnboarding.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            identityImage: "",
            serviceType: "IN_SHOP",
            specialties: [],
            portfolioImages: [],
        },
    });
    let message;
    if (!vendorProfile.registerationNumber) {
        message = "Please complete your vendor profile (registration number and location required).";
    }
    else if (vendorProfile.latitude == null || vendorProfile.longitude == null) {
        message = "No Location";
    }
    return { token, user, vendorProfile, message };
};
exports.loginWithVendorCheck = loginWithVendorCheck;
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
const getUserById = async (userId) => {
    return await prisma_1.default.user.findUnique({
        where: { id: userId },
        include: {
            vendorOnboarding: true,
            clientBookings: true,
            vendorBookings: true,
            products: true,
            vendorAvailabilities: true,
            // promotions: true,
            vendorReviews: true,
            clientReviews: true,
            notifications: true,
        },
    });
};
exports.getUserById = getUserById;
