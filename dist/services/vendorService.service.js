"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorServices = exports.addVendorService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const addVendorService = async (vendorId, serviceName, servicePrice, serviceImage) => {
    return await prisma_1.default.vendorService.create({
        data: {
            vendorId,
            serviceName,
            servicePrice,
            serviceImage,
        },
    });
};
exports.addVendorService = addVendorService;
const getVendorServices = async (vendorId) => {
    return await prisma_1.default.vendorService.findMany({
        where: { vendorId },
        orderBy: { createdAt: "desc" },
    });
};
exports.getVendorServices = getVendorServices;
