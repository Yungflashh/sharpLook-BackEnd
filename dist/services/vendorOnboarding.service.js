"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVendorProfile = exports.getVendorOnboarding = exports.createVendorOnboarding = void 0;
// src/services/vendorOnboarding.service.ts
const prisma_1 = __importDefault(require("../config/prisma"));
const createVendorOnboarding = async (userId, serviceType, identityImageUrl) => {
    return await prisma_1.default.vendorOnboarding.create({
        data: {
            userId,
            serviceType,
            identityImage: identityImageUrl, // Maps to your schema's identityImage
        },
    });
};
exports.createVendorOnboarding = createVendorOnboarding;
const getVendorOnboarding = async (userId) => {
    return await prisma_1.default.vendorOnboarding.findUnique({
        where: { userId },
    });
};
exports.getVendorOnboarding = getVendorOnboarding;
const updateVendorProfile = async (vendorId, { bio, location, servicesOffered, portfolioImages, availability, ...rest }) => {
    // 🔧 Update VendorOnboarding first
    const updatedProfile = await prisma_1.default.vendorOnboarding.update({
        where: { userId: vendorId },
        data: {
            bio,
            location,
            servicesOffered,
            portfolioImages,
            ...rest,
        },
    });
    // 🗓️ Optional: Update availability if provided
    let availabilityRecord = null;
    if (availability) {
        availabilityRecord = await prisma_1.default.vendorAvailability.upsert({
            where: { vendorId },
            update: {
                days: availability.days,
                fromTime: availability.fromTime,
                toTime: availability.toTime,
            },
            create: {
                vendorId,
                days: availability.days,
                fromTime: availability.fromTime,
                toTime: availability.toTime,
            },
        });
    }
    return {
        onboarding: updatedProfile,
        availability: availabilityRecord,
    };
};
exports.updateVendorProfile = updateVendorProfile;
