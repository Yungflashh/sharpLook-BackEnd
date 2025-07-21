"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getTopSellingProducts = exports.getAllProducts = exports.getVendorProducts = exports.createProduct = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const createProduct = async (vendorId, productName, price, qtyAvailable, picture) => {
    const status = qtyAvailable === 0 ? "not in stock" : "in stock";
    return await prisma_1.default.product.create({
        data: {
            productName,
            price,
            qtyAvailable,
            status,
            picture,
            vendor: {
                connect: { id: vendorId }
            }
        }
    });
};
exports.createProduct = createProduct;
const getVendorProducts = async (vendorId) => {
    return await prisma_1.default.product.findMany({
        where: { vendorId },
        orderBy: { createdAt: "desc" },
        include: {
            vendor: {
                include: {
                    vendorOnboarding: true,
                    vendorAvailabilities: true,
                    vendorServices: true,
                    vendorReviews: {
                        include: {
                            client: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                },
            },
        },
    });
};
exports.getVendorProducts = getVendorProducts;
const getAllProducts = async () => {
    return await prisma_1.default.product.findMany({
        orderBy: { createdAt: "desc" },
    });
};
exports.getAllProducts = getAllProducts;
const getTopSellingProducts = async (limit = 10) => {
    return await prisma_1.default.product.findMany({
        where: {
            unitsSold: {
                gt: 0,
            },
        },
        orderBy: {
            unitsSold: "desc",
        },
        include: {
            vendor: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },
        take: limit,
    });
};
exports.getTopSellingProducts = getTopSellingProducts;
const updateProduct = async (productId, vendorId, productName, price, qtyAvailable, picture) => {
    const status = qtyAvailable === 0 ? "not in stock" : "in stock";
    return await prisma_1.default.product.update({
        where: {
            id: productId,
            vendorId: vendorId, // ensures vendor can only edit their own product
        },
        data: {
            productName,
            price,
            qtyAvailable,
            status,
            ...(picture && { picture }), // only update if a new picture was uploaded
        },
    });
};
exports.updateProduct = updateProduct;
const deleteProduct = async (productId) => {
    return await prisma_1.default.product.delete({
        where: { id: productId },
    });
};
exports.deleteProduct = deleteProduct;
