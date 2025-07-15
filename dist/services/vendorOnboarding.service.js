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
const updateVendorProfile = async (userId, data) => {
    const existing = await prisma_1.default.vendorOnboarding.findUnique({
        where: { userId }
    });
    if (!existing) {
        throw new Error("Vendor profile not found. Please complete onboarding first.");
    }
    return await prisma_1.default.vendorOnboarding.update({
        where: { userId },
        data
    });
};
exports.updateVendorProfile = updateVendorProfile;
