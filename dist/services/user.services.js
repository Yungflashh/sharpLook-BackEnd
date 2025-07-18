"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorDetails = exports.getTopRatedVendors = exports.updateClientLocationPreferences = exports.updateUserProfile = exports.getUserById = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
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
        },
    });
    const sorted = topVendors
        .map((vendor) => {
        const reviews = vendor.vendorReviews;
        const total = reviews.length;
        const avgRating = total > 0
            ? reviews.reduce((acc, r) => acc + r.rating, 0) / total
            : 0;
        return {
            id: vendor.id,
            name: vendor.name,
            avatar: vendor.avatar,
            businessName: vendor.vendorOnboarding?.businessName,
            specialties: vendor.vendorOnboarding?.specialties,
            rating: avgRating,
            totalReviews: total,
        };
    })
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    return sorted;
};
exports.getTopRatedVendors = getTopRatedVendors;
const getVendorDetails = async (vendorId) => {
    // Fetch vendor onboarding, user, availability, services, reviews
    const vendor = await prisma_1.default.user.findUnique({
        where: { id: vendorId },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            phone: true,
            bio: true,
            vendorOnboarding: true,
            vendorAvailabilities: true,
            vendorServices: true,
            vendorReviews: {
                select: {
                    rating: true,
                    comment: true,
                    createdAt: true,
                    client: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            },
            promotions: {
                where: { isActive: true },
                orderBy: { startDate: "desc" },
            },
            products: {
                select: {
                    productName: true,
                    price: true,
                    picture: true,
                    status: true,
                },
            },
        },
    });
    if (!vendor)
        return null;
    return {
        id: vendor.id,
        name: `${vendor.firstName} ${vendor.lastName}`,
        bio: vendor.bio,
        avatar: vendor.avatar,
        email: vendor.email,
        phone: vendor.phone,
        onboarding: vendor.vendorOnboarding,
        availability: vendor.vendorAvailabilities,
        services: vendor.vendorServices,
        reviews: vendor.vendorReviews,
        promotions: vendor.promotions,
        products: vendor.products,
    };
};
exports.getVendorDetails = getVendorDetails;
