"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVendorProfile = exports.getVendorOnboarding = exports.createVendorOnboarding = void 0;
// src/services/vendorOnboarding.service.ts
const prisma_1 = __importDefault(require("../config/prisma"));
const createVendorOnboarding = async (userId, serviceType, identityImageUrl, // Cloudinary secure_url
registerationNumber) => {
    return await prisma_1.default.vendorOnboarding.create({
        data: {
            userId,
            serviceType,
            identityImage: identityImageUrl, // Maps to your schema's identityImage
            registerationNumber,
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
    return await prisma_1.default.vendorOnboarding.update({
        where: { userId },
        data,
    });
};
exports.updateVendorProfile = updateVendorProfile;
