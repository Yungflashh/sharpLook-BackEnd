"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProducts = exports.getVendorProducts = exports.createProduct = void 0;
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
    });
};
exports.getVendorProducts = getVendorProducts;
const getAllProducts = async () => {
    return await prisma_1.default.product.findMany({
        orderBy: { createdAt: "desc" },
    });
};
exports.getAllProducts = getAllProducts;
