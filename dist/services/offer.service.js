"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOffer = exports.getNearbyOffersByCoordinates = exports.selectVendorForOffer = exports.vendorAcceptOffer = exports.getVendorsForOffer = exports.createServiceOffer = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createServiceOffer = async (clientId, data) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    return await prisma_1.default.serviceOffer.create({
        data: {
            clientId,
            ...data,
            expiresAt
        }
    });
};
exports.createServiceOffer = createServiceOffer;
const getVendorsForOffer = async (offerId) => {
    return await prisma_1.default.vendorOffer.findMany({
        where: { serviceOfferId: offerId },
        include: { vendor: true }
    });
};
exports.getVendorsForOffer = getVendorsForOffer;
const vendorAcceptOffer = async (vendorId, offerId) => {
    const existing = await prisma_1.default.vendorOffer.findFirst({
        where: { vendorId, serviceOfferId: offerId }
    });
    if (existing) {
        throw new Error("You’ve already accepted this offer.");
    }
    return await prisma_1.default.vendorOffer.create({
        data: {
            vendorId,
            serviceOfferId: offerId
        }
    });
};
exports.vendorAcceptOffer = vendorAcceptOffer;
const selectVendorForOffer = async (offerId, selectedVendorId) => {
    // Update offer status
    await prisma_1.default.serviceOffer.update({
        where: { id: offerId },
        data: { status: "SELECTED" }
    });
    // Mark the selected vendor
    await prisma_1.default.vendorOffer.updateMany({
        where: { serviceOfferId: offerId },
        data: { isAccepted: false }
    });
    await prisma_1.default.vendorOffer.updateMany({
        where: {
            serviceOfferId: offerId,
            vendorId: selectedVendorId
        },
        data: { isAccepted: true }
    });
};
exports.selectVendorForOffer = selectVendorForOffer;
const EARTH_RADIUS_KM = 6371;
function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
}
const getNearbyOffersByCoordinates = async (vendorId) => {
    const vendor = await prisma_1.default.user.findUnique({
        where: { id: vendorId },
        include: {
            vendorOnboarding: true,
        },
    });
    if (!vendor?.vendorOnboarding?.latitude ||
        !vendor?.vendorOnboarding?.longitude) {
        throw new Error("Vendor coordinates not found.");
    }
    const allOffers = await prisma_1.default.serviceOffer.findMany({
        where: {
            status: "PENDING",
            expiresAt: { gte: new Date() },
        },
        include: {
            client: true,
        },
    });
    const nearbyOffers = allOffers.filter((offer) => {
        if (!offer.latitude || !offer.longitude)
            return false;
        const distance = haversineDistance(vendor.vendorOnboarding.latitude, vendor.vendorOnboarding.longitude, offer.latitude, offer.longitude);
        return distance <= 10; // limit to 10km radius
    });
    return nearbyOffers;
};
exports.getNearbyOffersByCoordinates = getNearbyOffersByCoordinates;
const cancelOffer = async (offerId, clientId) => {
    return await prisma_1.default.serviceOffer.updateMany({
        where: { id: offerId, clientId },
        data: { status: "CANCELLED" },
    });
};
exports.cancelOffer = cancelOffer;
