"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTipToOffer = exports.getClientOffers = exports.getAllAvailableOffers = exports.cancelOffer = exports.getNearbyOffersByCoordinates = exports.selectVendorForOffer = exports.vendorAcceptOffer = exports.getVendorsForOffer = exports.createServiceOffer = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createServiceOffer = async (clientId, data, serviceImage) => {
    const requiredFields = [
        "serviceName",
        "serviceType",
        "offerAmount",
        "fullAddress",
        "landMark",
        "date",
        "time",
    ];
    for (const field of requiredFields) {
        if (!data[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    return await prisma_1.default.serviceOffer.create({
        data: {
            clientId,
            serviceName: data.serviceName,
            serviceType: data.serviceType,
            offerAmount: Number(data.offerAmount),
            date: data.date,
            time: data.time,
            latitude: data.latitude ? parseFloat(data.latitude) : undefined,
            longitude: data.longitude ? parseFloat(data.longitude) : undefined,
            serviceImage,
            expiresAt,
        },
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
        where: { vendorId, serviceOfferId: offerId },
    });
    if (existing) {
        throw new Error("You’ve already accepted this offer.");
    }
    // ✅ Check if the offer is still open
    const offer = await prisma_1.default.serviceOffer.findUnique({
        where: { id: offerId },
        select: {
            clientId: true,
            serviceName: true,
            serviceType: true,
            serviceImage: true,
            status: true, // <-- Make sure to check this
        },
    });
    if (!offer)
        throw new Error("Offer not found");
    if (offer.status !== "PENDING") {
        throw new Error("This offer is no longer accepting vendors.");
    }
    // Get vendor info
    const vendor = await prisma_1.default.user.findUnique({
        where: { id: vendorId },
        select: {
            firstName: true,
            lastName: true,
        },
    });
    if (!vendor)
        throw new Error("Vendor not found");
    // Create the vendor-offer link
    const newAcceptance = await prisma_1.default.vendorOffer.create({
        data: {
            vendorId,
            serviceOfferId: offerId,
        },
    });
    // Notify the client
    await prisma_1.default.notification.create({
        data: {
            userId: offer.clientId,
            type: "OFFER_ACCEPTED",
            message: `${vendor.firstName} ${vendor.lastName} has accepted your service offer: ${offer.serviceName}`,
        },
    });
    return newAcceptance;
};
exports.vendorAcceptOffer = vendorAcceptOffer;
const selectVendorForOffer = async (offerId, selectedVendorId) => {
    try {
        // Update offer status to "SELECTED"
        const updatedOffer = await prisma_1.default.serviceOffer.update({
            where: { id: offerId },
            data: { status: "SELECTED" },
        });
        console.log("Offer after update:", updatedOffer);
        // Reset all vendor isAccepted to false
        await prisma_1.default.vendorOffer.updateMany({
            where: { serviceOfferId: offerId },
            data: { isAccepted: false },
        });
        // Set the selected vendor's isAccepted to true
        await prisma_1.default.vendorOffer.updateMany({
            where: {
                serviceOfferId: offerId,
                vendorId: selectedVendorId,
            },
            data: { isAccepted: true },
        });
        // Get offer info
        const offer = await prisma_1.default.serviceOffer.findUnique({
            where: { id: offerId },
            select: {
                serviceName: true,
            },
        });
        // Send notification to the selected vendor
        await prisma_1.default.notification.create({
            data: {
                userId: selectedVendorId,
                type: "VENDOR_SELECTED",
                message: `You’ve been selected for the service: ${offer?.serviceName}`,
            },
        });
        return { success: true, message: "Vendor selected and notified." };
    }
    catch (error) {
        console.error("Error selecting vendor:", error);
        return { success: false, message: "Something went wrong during vendor selection." };
    }
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
const getAllAvailableOffers = async () => {
    return prisma_1.default.serviceOffer.findMany({
        where: {
            status: "PENDING", // or whatever your "open" status is
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            client: {
                select: {
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });
};
exports.getAllAvailableOffers = getAllAvailableOffers;
const getClientOffers = async (clientId) => {
    return await prisma_1.default.serviceOffer.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
        include: {
            vendorOffers: {
                include: {
                    vendor: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phone: true,
                            vendorOnboarding: {
                                select: {
                                    businessName: true,
                                    latitude: true,
                                    longitude: true,
                                },
                            },
                            vendorAvailabilities: {
                                select: {
                                    days: true,
                                    fromTime: true,
                                    toTime: true,
                                },
                            },
                            vendorReviews: {
                                where: {
                                    OR: [
                                        { type: 'VENDOR' },
                                        { type: 'SERVICE' },
                                    ],
                                },
                                select: {
                                    type: true,
                                    rating: true,
                                    comment: true,
                                    createdAt: true,
                                    service: {
                                        select: {
                                            serviceName: true,
                                        },
                                    },
                                    client: {
                                        select: {
                                            id: true,
                                            firstName: true,
                                            lastName: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};
exports.getClientOffers = getClientOffers;
const addTipToOffer = async (clientId, offerId, tipAmount) => {
    const offer = await prisma_1.default.serviceOffer.findUnique({
        where: { id: offerId },
    });
    if (!offer)
        throw new Error("Offer not found");
    if (offer.clientId !== clientId)
        throw new Error("Unauthorized action");
    const newAmount = Number(offer.offerAmount) + Number(tipAmount);
    return await prisma_1.default.serviceOffer.update({
        where: { id: offerId },
        data: { offerAmount: newAmount },
    });
};
exports.addTipToOffer = addTipToOffer;
