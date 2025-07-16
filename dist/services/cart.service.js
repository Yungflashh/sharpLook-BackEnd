"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromCart = exports.getUserCart = exports.addToCart = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const addToCart = async (userId, productId) => {
    return await prisma_1.default.cartItem.create({
        data: { userId, productId },
        include: { product: true },
    });
};
exports.addToCart = addToCart;
const getUserCart = async (userId) => {
    return await prisma_1.default.cartItem.findMany({
        where: { userId },
        include: { product: true },
    });
};
exports.getUserCart = getUserCart;
const removeFromCart = async (userId, productId) => {
    return await prisma_1.default.cartItem.deleteMany({
        where: { userId, productId },
    });
};
exports.removeFromCart = removeFromCart;
