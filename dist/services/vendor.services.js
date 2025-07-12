"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPortfolioImages = exports.addPortfolioImages = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const addPortfolioImages = async (userId, imageUrls) => {
    return await prisma_1.default.vendorOnboarding.update({
        where: { userId },
        data: {
            portfolioImages: { push: imageUrls },
        },
    });
};
exports.addPortfolioImages = addPortfolioImages;
const getPortfolioImages = async (userId) => {
    return await prisma_1.default.vendorOnboarding.findUnique({
        where: { userId },
        select: { portfolioImages: true },
    });
};
exports.getPortfolioImages = getPortfolioImages;
