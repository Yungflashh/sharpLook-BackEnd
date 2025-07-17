"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVendorService = exports.editVendorService = exports.getAllServices = exports.getVendorServices = exports.addVendorService = void 0;
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
// ✅ Get all services (admin/global purpose)
const getAllServices = async () => {
    return await prisma_1.default.vendorService.findMany({
        where: {
            vendor: {
                isNot: null,
            },
        },
        orderBy: { createdAt: "desc" },
        include: {
            vendor: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                },
            },
        },
    });
};
exports.getAllServices = getAllServices;
// ✅ Edit (update) a vendor service
const editVendorService = async (serviceId, updateData) => {
    return await prisma_1.default.vendorService.update({
        where: { id: serviceId },
        data: updateData,
    });
};
exports.editVendorService = editVendorService;
// ✅ Delete a vendor service
const deleteVendorService = async (serviceId) => {
    return await prisma_1.default.vendorService.delete({
        where: { id: serviceId },
    });
};
exports.deleteVendorService = deleteVendorService;
