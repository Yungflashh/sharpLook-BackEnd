"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformStats = exports.adjustWalletBalance = exports.getReferralHistory = exports.getAllMessages = exports.getAllReviewsWithContent = exports.deleteReview = exports.suspendPromotion = exports.getAllPromotions = exports.verifyVendorIdentity = exports.resolveDispute = exports.getAllDisputes = exports.getAllBookingsDetailed = exports.getAllPayments = exports.getAllOrders = exports.rejectProduct = exports.suspendProduct = exports.approveProduct = exports.deleteProduct = exports.getProductDetail = exports.deleteUser = exports.getUserDetail = exports.getSoldProducts = exports.getAllProducts = exports.getDailyActiveUsers = exports.getNewUsersByRange = exports.getUsersByRole = exports.promoteUserToAdmin = exports.unbanUser = exports.banUser = exports.getAllBookings = exports.getAllUsers = void 0;
// src/services/admin.service.ts
const prisma_1 = __importDefault(require("../config/prisma"));
const date_fns_1 = require("date-fns");
const getAllUsers = async () => {
    return await prisma_1.default.user.findMany({
        select: { id: true, email: true, role: true, isEmailVerified: true },
    });
};
exports.getAllUsers = getAllUsers;
const getAllBookings = async () => {
    return await prisma_1.default.booking.findMany({
        include: { client: true, vendor: true },
    });
};
exports.getAllBookings = getAllBookings;
const banUser = async (userId) => {
    return await prisma_1.default.user.update({
        where: { id: userId },
        data: { isBanned: true },
    });
};
exports.banUser = banUser;
const unbanUser = async (userId) => {
    return await prisma_1.default.user.update({
        where: { id: userId },
        data: { isBanned: false },
    });
};
exports.unbanUser = unbanUser;
const promoteUserToAdmin = async (adminId) => {
    console.log(adminId);
    const user = await prisma_1.default.user.findUnique({ where: { id: adminId } });
    if (!user)
        throw new Error("User not found");
    return await prisma_1.default.user.update({
        where: { id: adminId },
        data: {
            role: "ADMIN",
            powerGiven: true, // ✅ Set admin power as granted
        },
    });
};
exports.promoteUserToAdmin = promoteUserToAdmin;
const getUsersByRole = async (role) => {
    return await prisma_1.default.user.findMany({
        where: { role },
        orderBy: { createdAt: "desc" }
    });
};
exports.getUsersByRole = getUsersByRole;
const getNewUsersByRange = async (range) => {
    let date;
    switch (range) {
        case "days":
            date = (0, date_fns_1.subDays)(new Date(), 7);
            break;
        case "weeks":
            date = (0, date_fns_1.subWeeks)(new Date(), 4);
            break;
        case "months":
            date = (0, date_fns_1.subMonths)(new Date(), 6);
            break;
        case "years":
            date = (0, date_fns_1.subYears)(new Date(), 1);
            break;
        default:
            throw new Error("Invalid range");
    }
    return await prisma_1.default.user.findMany({
        where: { createdAt: { gte: date } },
        orderBy: { createdAt: "desc" }
    });
};
exports.getNewUsersByRange = getNewUsersByRange;
const getDailyActiveUsers = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return await prisma_1.default.user.findMany({
        where: { updatedAt: { gte: today } }
    });
};
exports.getDailyActiveUsers = getDailyActiveUsers;
const getAllProducts = async () => {
    return await prisma_1.default.product.findMany({
        orderBy: { createdAt: "desc" }
    });
};
exports.getAllProducts = getAllProducts;
const getSoldProducts = async () => {
    return await prisma_1.default.product.findMany({
        where: { qtyAvailable: 0 },
        orderBy: { createdAt: "desc" }
    });
};
exports.getSoldProducts = getSoldProducts;
const getUserDetail = async (userId) => {
    return await prisma_1.default.user.findUnique({
        where: { id: userId },
        include: {
            vendorOnboarding: true,
            wallet: true,
            clientBookings: true,
            vendorBookings: true,
            products: true,
        },
    });
};
exports.getUserDetail = getUserDetail;
const deleteUser = async (userId) => {
    return await prisma_1.default.user.delete({ where: { id: userId } });
};
exports.deleteUser = deleteUser;
const getProductDetail = async (productId) => {
    return await prisma_1.default.product.findUnique({
        where: { id: productId },
        include: {
            vendor: true,
            reviews: true,
        },
    });
};
exports.getProductDetail = getProductDetail;
const deleteProduct = async (productId) => {
    return await prisma_1.default.product.delete({ where: { id: productId } });
};
exports.deleteProduct = deleteProduct;
const approveProduct = async (productId) => {
    return await prisma_1.default.product.update({
        where: { id: productId },
        data: { status: "approved" },
    });
};
exports.approveProduct = approveProduct;
const suspendProduct = async (productId) => {
    return await prisma_1.default.product.update({
        where: { id: productId },
        data: { status: "suspended" },
    });
};
exports.suspendProduct = suspendProduct;
const rejectProduct = async (productId, reason) => {
    return await prisma_1.default.product.update({
        where: { id: productId },
        data: { status: "rejected", description: reason || "" },
    });
};
exports.rejectProduct = rejectProduct;
const getAllOrders = async () => {
    return await prisma_1.default.order.findMany({
        include: {
            user: true,
        },
        orderBy: { createdAt: "desc" }
    });
};
exports.getAllOrders = getAllOrders;
const getAllPayments = async () => {
    return await prisma_1.default.transaction.findMany({
        include: {
            wallet: {
                include: { user: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });
};
exports.getAllPayments = getAllPayments;
const getAllBookingsDetailed = async () => {
    return await prisma_1.default.booking.findMany({
        include: {
            client: true,
            vendor: true,
            reviews: true,
        },
        orderBy: { createdAt: "desc" }
    });
};
exports.getAllBookingsDetailed = getAllBookingsDetailed;
const getAllDisputes = async () => {
    return await prisma_1.default.dispute.findMany({
        include: {
            raisedBy: true,
            booking: true,
        },
        orderBy: { createdAt: "desc" }
    });
};
exports.getAllDisputes = getAllDisputes;
const resolveDispute = async (disputeId, resolution) => {
    return await prisma_1.default.dispute.update({
        where: { id: disputeId },
        data: {
            status: "RESOLVED",
            resolution,
        },
    });
};
exports.resolveDispute = resolveDispute;
const verifyVendorIdentity = async (vendorId) => {
    return prisma_1.default.vendorOnboarding.update({
        where: { userId: vendorId },
        data: { bio: "Verified by admin" }
    });
};
exports.verifyVendorIdentity = verifyVendorIdentity;
const getAllPromotions = async () => {
    return prisma_1.default.promotion.findMany({
        include: { vendor: true },
        orderBy: { createdAt: "desc" }
    });
};
exports.getAllPromotions = getAllPromotions;
const suspendPromotion = async (promotionId) => {
    return prisma_1.default.promotion.update({
        where: { id: promotionId },
        data: { isActive: false }
    });
};
exports.suspendPromotion = suspendPromotion;
const deleteReview = async (reviewId) => {
    return prisma_1.default.review.delete({
        where: { id: reviewId }
    });
};
exports.deleteReview = deleteReview;
const getAllReviewsWithContent = async () => {
    return prisma_1.default.review.findMany({
        where: { comment: { not: null } },
        include: {
            vendor: true,
            client: true,
            product: true,
            service: true
        },
        orderBy: { createdAt: "desc" }
    });
};
exports.getAllReviewsWithContent = getAllReviewsWithContent;
const getAllMessages = async () => {
    return prisma_1.default.message.findMany({
        include: {
            sender: true,
            receiver: true
        },
        orderBy: { createdAt: "desc" }
    });
};
exports.getAllMessages = getAllMessages;
const getReferralHistory = async () => {
    return prisma_1.default.referral.findMany({
        include: {
            referredBy: true,
            referredUser: true
        },
        orderBy: { createdAt: "desc" }
    });
};
exports.getReferralHistory = getReferralHistory;
const adjustWalletBalance = async (userId, amount) => {
    const user = await prisma_1.default.user.findUnique({ where: { id: userId }, include: { wallet: true } });
    if (!user || !user.walletId)
        throw new Error("Wallet not found");
    return prisma_1.default.wallet.update({
        where: { id: user.walletId },
        data: {
            balance: { increment: amount }
        }
    });
};
exports.adjustWalletBalance = adjustWalletBalance;
const getPlatformStats = async () => {
    const [totalUsers, totalVendors, totalBookings, totalDisputes, totalTransactions] = await Promise.all([
        prisma_1.default.user.count(),
        prisma_1.default.user.count({ where: { role: "VENDOR" } }),
        prisma_1.default.booking.count(),
        prisma_1.default.dispute.count(),
        prisma_1.default.transaction.count()
    ]);
    return {
        totalUsers,
        totalVendors,
        totalBookings,
        totalDisputes,
        totalTransactions
    };
};
exports.getPlatformStats = getPlatformStats;
