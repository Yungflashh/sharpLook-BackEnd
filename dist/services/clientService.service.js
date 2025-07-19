"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorServicesByVendorId = exports.getAllVendorServices = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getAllVendorServices = async () => {
    try {
        // No 'where' clause here — fetch all vendor services
        const services = await prisma_1.default.vendorService.findMany({
            include: { vendor: true } // optional: include vendor info
        });
        return services;
    }
    catch (error) {
        console.error('Failed to fetch all services:', error);
        throw error;
    }
};
exports.getAllVendorServices = getAllVendorServices;
const getVendorServicesByVendorId = async (userId) => {
    return await prisma_1.default.vendorService.findMany({
        where: { userId },
        include: {
            vendor: {
                select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    vendorOnboarding: true,
                },
            },
        },
    });
};
exports.getVendorServicesByVendorId = getVendorServicesByVendorId;
