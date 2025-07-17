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
const registerUser = async (email, password, firstName, lastName, role, acceptedPersonalData, phone, referredByCode) => {
    console.log("➡️ Starting user registration...");
    console.log("Incoming data:", { email, referredByCode });
    const existing = await prisma_1.default.user.findUnique({ where: { email } });
    if (existing) {
        console.log("❌ User already exists with email:", email);
        throw new Error("Email already in use");
    }
    const hash = await bcryptjs_1.default.hash(password, 10);
    console.log("🔒 Password hashed");
    const referralCode = (0, referral_1.generateReferralCode)();
    console.log("🎁 Generated referral code:", referralCode);
    const userData = {
        firstName,
        lastName,
        email,
        password: hash,
        role,
        acceptedPersonalData,
        phone,
        referralCode,
    };
    let referredByUser = null;
    if (referredByCode) {
        console.log("🔍 Looking up referrer by referralCode:", referredByCode);
        referredByUser = await prisma_1.default.user.findUnique({
            where: { referralCode: referredByCode },
        });
        if (referredByUser) {
            console.log("✅ Found referrer user:", referredByUser.id);
            userData.referredBy = {
                connect: { id: referredByUser.id }
            };
        }
        else {
            console.log("⚠️ No user found with referralCode:", referredByCode);
        }
    }
    console.log("📦 Creating user with data:", userData);
    const user = await prisma_1.default.user.create({ data: userData });
    console.log("💰 Creating wallet for new user...");
    const userWallet = await prisma_1.default.wallet.create({
        data: {
            userId: user.id,
            balance: 0,
            status: "ACTIVE",
        },
    });
    console.log("🔗 Linking wallet to user...");
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: { walletId: userWallet.id },
    });
    if (referredByUser?.walletId) {
        console.log("💸 Crediting referrer's wallet:", referredByUser.walletId);
        await (0, wallet_service_1.creditWallet)(referredByUser.walletId, 100);
        console.log("🎉 Crediting new user's wallet:", userWallet.id);
        await (0, wallet_service_1.creditWallet)(userWallet.id, 100);
    }
    else {
        console.log("ℹ️ No valid referrer to credit.");
    }
    const updatedUser = await prisma_1.default.user.findUnique({
        where: { id: user.id },
        include: {
            referredBy: {
                select: {
                    firstName: true,
                    lastName: true,
                    referralCode: true,
                },
            },
        },
    });
    if (!updatedUser) {
        console.log("❌ Could not retrieve updated user.");
        throw new Error("User registration failed during final fetch.");
    }
    console.log("✅ User registered:", updatedUser.id);
    return updatedUser;
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
