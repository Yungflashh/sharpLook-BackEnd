"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserAvatar = exports.getVendorDetails = exports.getTopRatedVendors = exports.updateClientLocationPreferences = exports.updateUserProfile = exports.getUserById = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const cloudinary_1 = require("../utils/cloudinary");
const getUserById = async (id) => {
    return await prisma_1.default.user.findUnique({ where: { id } });
};
exports.getUserById = getUserById;
const updateUserProfile = async (id, data) => {
    return await prisma_1.default.user.update({
        where: { id },
        data
    });
};
exports.updateUserProfile = updateUserProfile;
const updateClientLocationPreferences = async (userId, latitude, longitude, radiusKm) => {
    return await prisma_1.default.user.update({
        where: { id: userId },
        data: {
            preferredLatitude: latitude,
            preferredLongitude: longitude,
            preferredRadiusKm: radiusKm,
        },
    });
};
exports.updateClientLocationPreferences = updateClientLocationPreferences;
const getTopRatedVendors = async (limit = 10) => {
    const topVendors = await prisma_1.default.user.findMany({
        where: { role: "VENDOR" },
        include: {
            vendorOnboarding: true,
            vendorReviews: true,
            vendorServices: true,
            vendorAvailabilities: true,
            promotions: true,
            wallet: true,
            products: true,
        },
    });
    const sorted = topVendors
        .map((vendor) => {
        const reviews = vendor.vendorReviews || [];
        const total = reviews.length;
        const avgRating = total > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / total
            : 0;
        return {
            ...vendor,
            rating: avgRating,
            totalReviews: total,
            products: vendor.products // ✅ Ensure products are explicitly returned
        };
    })
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    return sorted;
};
exports.getTopRatedVendors = getTopRatedVendors;
const getVendorDetails = async (vendorId) => {
    const vendor = await prisma_1.default.user.findUnique({
        where: {
            id: vendorId
        },
        include: {
            vendorOnboarding: true,
            vendorAvailabilities: true,
            vendorServices: true,
            vendorReviews: {
                include: {
                    client: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            },
            promotions: {
                where: {
                    isActive: true
                },
                orderBy: {
                    startDate: "desc"
                }
            },
            products: true, // Include full product info, not just selected fields
            wallet: true,
            cartItems: true,
            wishlistItems: true,
            orders: true,
            referralsMade: true,
            referralsGotten: true,
            notifications: true,
            sentMessages: true,
            receivedMessages: true,
        }
    });
    if (!vendor)
        return null;
    // Optional: Compute average rating & total reviews
    const reviews = vendor.vendorReviews || [];
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        : 0;
    return {
        ...vendor,
        totalReviews,
        avgRating
    };
};
exports.getVendorDetails = getVendorDetails;
const updateUserAvatar = async (userId, fileBuffer) => {
    const cloudinaryResult = await (0, cloudinary_1.uploadBufferToCloudinary)(fileBuffer, "avatars");
    const user = await prisma_1.default.user.update({
        where: { id: userId },
        data: { avatar: cloudinaryResult.secure_url },
    });
    return user.avatar;
};
exports.updateUserAvatar = updateUserAvatar;
