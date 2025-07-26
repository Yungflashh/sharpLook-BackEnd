"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyNearbyVendors = exports.deleteNotification = exports.getUserNotifications = exports.createNotification = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const distance_1 = require("../utils/distance");
const createNotification = async (userId, message, type = "BOOKING") => {
    return await prisma_1.default.notification.create({
        data: {
            userId,
            message,
            type,
        },
    });
};
exports.createNotification = createNotification;
const getUserNotifications = async (userId) => {
    return await prisma_1.default.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
};
exports.getUserNotifications = getUserNotifications;
const deleteNotification = async (notificationId) => {
    return await prisma_1.default.notification.delete({
        where: { id: notificationId },
    });
};
exports.deleteNotification = deleteNotification;
const notifyNearbyVendors = async (offer) => {
    const vendors = await prisma_1.default.user.findMany({
        where: {
            role: "VENDOR",
            vendorOnboarding: {
                NOT: {
                    latitude: null,
                },
            },
        },
        include: {
            vendorOnboarding: true,
        },
    });
    const filtered = vendors.filter((vendor) => {
        const coords = vendor.vendorOnboarding;
        if (!coords.latitude || !coords.longitude)
            return false;
        const distance = (0, distance_1.haversineDistanceKm)(coords.latitude, coords.longitude, offer.latitude, offer.longitude);
        return distance <= 10;
    });
    const notifications = filtered.map((vendor) => ({
        userId: vendor.id,
        type: "OFFER",
        message: `New service offer: ${offer.serviceName} - ₦${offer.offerAmount}`,
        metadata: { offerId: offer.id },
    }));
    await prisma_1.default.notification.createMany({ data: notifications });
};
exports.notifyNearbyVendors = notifyNearbyVendors;
