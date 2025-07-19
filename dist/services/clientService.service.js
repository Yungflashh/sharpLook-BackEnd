"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorServicesByVendorId = exports.getAllVendorServices = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const getAllVendorServices = async () => {
    return await prisma_1.default.vendorService.findMany();
};
exports.getAllVendorServices = getAllVendorServices;
const getVendorServicesByVendorId = async (vendorId) => {
    return await prisma_1.default.vendorService.findMany({
        where: { vendorId },
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
