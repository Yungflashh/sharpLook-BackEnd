"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllServices = exports.getAllNotifications = exports.getPlatformStats = exports.adjustWalletBalance = exports.getReferralHistory = exports.getAllMessages = exports.getAllReviewsWithContent = exports.deleteReview = exports.suspendPromotion = exports.getAllPromotions = exports.verifyVendorIdentity = exports.resolveDispute = exports.getAllDisputes = exports.getAllBookingsDetailed = exports.getAllPayments = exports.getAllOrders = exports.rejectProduct = exports.suspendProduct = exports.approveProduct = exports.deleteProduct = exports.getProductDetail = exports.deleteUser = exports.getUserDetail = exports.getSoldProducts = exports.getAllProducts = exports.getDailyActiveUsers = exports.getNewUsersByRange = exports.getUsersByRole = exports.promoteUserToAdmin = exports.unbanUser = exports.banUser = exports.getAllBookings = exports.getAllUsers = exports.sendBroadcast = void 0;
// src/services/admin.service.ts
const prisma_1 = __importDefault(require("../config/prisma"));
const date_fns_1 = require("date-fns");
const sendBroadcast = async (adminId, title, message, audience) => {
    const broadcast = await prisma_1.default.broadcast.create({
        data: {
            title,
            message,
            audience,
            createdById: adminId,
        },
    });
    const roles = audience === "BOTH"
        ? ["CLIENT", "VENDOR"]
        : [audience === "CLIENT" ? "CLIENT" : "VENDOR"];
    const users = await prisma_1.default.user.findMany({
        where: { role: { in: roles } },
        select: { id: true },
    });
    if (users.length === 0)
        return broadcast;
    const notifications = users.map((user) => ({
        userId: user.id,
        message,
        type: "BROADCAST",
    }));
    await prisma_1.default.notification.createMany({ data: notifications });
    await prisma_1.default.broadcast.update({
        where: { id: broadcast.id },
        data: { sentCount: users.length },
    });
    return { message: `Broadcast sent to ${users.length} users.` };
};
exports.sendBroadcast = sendBroadcast;
const getAllUsers = async () => {
    const users = await prisma_1.default.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            isEmailVerified: true,
            isOtpVerified: true,
            acceptedPersonalData: true,
            powerGiven: true,
            isBanned: true,
            vendorOnboarding: {
                select: {
                    businessName: true,
                    bio: true,
                    location: true,
                    serviceType: true,
                    specialties: true,
                    serviceRadiusKm: true,
                    servicesOffered: true,
                    profileImage: true,
                    createdAt: true
                }
            },
            vendorReviews: {
                select: { rating: true }
            }
        }
    });
    // Map in average rating & review count for vendors
    return users.map((user) => {
        let averageRating = null;
        let totalReviews = 0;
        if (user.role === "VENDOR" && user.vendorReviews.length > 0) {
            totalReviews = user.vendorReviews.length;
            const sum = user.vendorReviews.reduce((acc, r) => acc + r.rating, 0);
            averageRating = sum / totalReviews;
        }
        return {
            ...user,
            averageRating,
            totalReviews
        };
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
            client: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    location: true,
                    avatar: true,
                    bio: true,
                    referralCode: true,
                    preferredLatitude: true,
                    preferredLongitude: true,
                },
            },
            vendor: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    bio: true,
                    referralCode: true,
                    vendorOnboarding: {
                        select: {
                            businessName: true,
                            serviceType: true,
                            location: true,
                            // approvalStatus: true,
                            pricing: true,
                            profileImage: true,
                            specialties: true,
                            latitude: true,
                            longitude: true,
                            serviceRadiusKm: true,
                        },
                    },
                },
            },
            service: {
                select: {
                    id: true,
                    serviceName: true,
                    servicePrice: true,
                    serviceImage: true,
                    description: true,
                },
            },
            reviews: {
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    type: true,
                    createdAt: true,
                    client: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            },
            dispute: {
                select: {
                    id: true,
                    reason: true,
                    status: true,
                    resolution: true,
                    imageUrl: true,
                    createdAt: true,
                    raisedBy: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" },
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
    const oneWeekAgo = (0, date_fns_1.subDays)(new Date(), 7);
    const [totalUsers, totalVendors, totalBookings, totalDisputes, totalTransactions, totalProducts, inStockProducts, outOfStockProducts, totalUnitsSold, newProductsThisWeek, totalEmailVerified, totalPhoneVerified, totalAcceptedPersonalData] = await Promise.all([
        prisma_1.default.user.count(),
        prisma_1.default.user.count({ where: { role: "VENDOR" } }),
        prisma_1.default.booking.count(),
        prisma_1.default.dispute.count(),
        prisma_1.default.transaction.count(),
        prisma_1.default.product.count(),
        prisma_1.default.product.count({ where: { qtyAvailable: { gt: 0 } } }),
        prisma_1.default.product.count({ where: { qtyAvailable: 0 } }),
        prisma_1.default.product.aggregate({ _sum: { unitsSold: true } }),
        prisma_1.default.product.count({ where: { createdAt: { gte: oneWeekAgo } } }),
        prisma_1.default.user.count({ where: { isEmailVerified: true } }),
        prisma_1.default.user.count({ where: { isOtpVerified: true } }),
        prisma_1.default.user.count({ where: { acceptedPersonalData: true } })
    ]);
    return {
        totalUsers,
        totalVendors,
        totalBookings,
        totalDisputes,
        totalTransactions,
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        totalUnitsSold: totalUnitsSold._sum.unitsSold || 0,
        newProductsThisWeek,
        totalEmailVerified,
        totalPhoneVerified,
        totalAcceptedPersonalData
    };
};
exports.getPlatformStats = getPlatformStats;
const getAllNotifications = async () => {
    return await prisma_1.default.notification.findMany({
        include: {
            user: true, // If notifications are tied to users
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};
exports.getAllNotifications = getAllNotifications;
const getAllServices = async () => {
    return await prisma_1.default.vendorService.findMany({
        include: {
            vendor: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};
exports.getAllServices = getAllServices;
